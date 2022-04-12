# frozen_string_literal: true
class Course::LessonPlan::Strategies::ElasticPersonalizationStrategy < # rubocop:disable Metrics/ClassLength
  Course::LessonPlan::Strategies::BasePersonalizationStrategy
  MIN_OVERALL_LIMIT = 0.67 # The fastest that a student can finish a course
  MAX_OVERALL_LIMIT = 2.0 # The slowest that a student can finish a course
  HARD_MIN_LEARNING_RATE = 0.5
  NUM_PAST_LEARNING_RATES = 3

  # Returns precomputed data for the given course user.
  # This includes data returned by base strategy, in addition to the mean of the past few learning rates of the given
  # course user. If the course user has less than the required number of past learning rates, the value will be nil.
  #
  # The number is configured via NUM_PAST_LEARNING_RATES.
  #
  # @param [CourseUser] course_user The course user to compute data for.
  # @return [Hash] Precomputed data to aid execution.
  def precompute_data(course_user)
    super_data = super(course_user)
    learning_rate_records = course_user.learning_rate_records

    return super_data if learning_rate_records.nil? || learning_rate_records.size < NUM_PAST_LEARNING_RATES

    mean_past_learning_rate = learning_rate_records.
                              first(NUM_PAST_LEARNING_RATES).
                              map(&:learning_rate).
                              sum / NUM_PAST_LEARNING_RATES
    super_data.merge({ mean_past_learning_rate: mean_past_learning_rate })
  end

  def execute(course_user, precomputed_data, items_to_shift = nil)
    return if precomputed_data[:learning_rate_ema].nil?

    @course_tz = course_user.course.time_zone
    if precomputed_data[:learning_rate_ema] < 1
      execute_fast_learner(course_user, precomputed_data, items_to_shift)
    else
      execute_slow_learner(course_user, precomputed_data, items_to_shift)
    end
  end

  private

  # METHODS SPECIFIC TO THE FAST LEARNER

  def execute_fast_learner(course_user, precomputed_data, items_to_shift) # rubocop:disable Metrics/AbcSize, Metrics/MethodLength
    points = initial_points(precomputed_data)
    has_slowed_down = !precomputed_data[:mean_past_learning_rate].nil? &&
                      precomputed_data[:learning_rate_ema] > precomputed_data[:mean_past_learning_rate]
    @slow_down_ratio = if has_slowed_down
                         precomputed_data[:learning_rate_ema] / precomputed_data[:mean_past_learning_rate]
                       end

    course_user.transaction do
      precomputed_data[:items].each do |item|
        points = update_points(course_user, item, precomputed_data[:submitted_items], points)
        next if cannot_shift_item(course_user, item, precomputed_data[:submitted_items], points[:fast_reference_point],
                                  items_to_shift)

        reference_time = item.reference_time_for(course_user)
        personal_time = item.find_or_create_personal_time_for(course_user)
        open_and_straggling = item_is_open_and_straggling(personal_time, reference_time)

        unless open_and_straggling
          shift_start_at(personal_time, reference_time, points, precomputed_data[:learning_rate_ema])
        end
        reset_bonus_end_at(personal_time, reference_time)
        reset_or_shift_end_at(personal_time, reference_time, points, open_and_straggling)
        personal_time.save!
      end
    end
  end

  def item_is_open_and_straggling(personal_time, reference_time)
    personal_time.end_at && personal_time.end_at > reference_time.end_at && personal_time.start_at < Time.zone.now
  end

  def shift_start_at(personal_time, reference_time, points, learning_rate_ema)
    if personal_time.start_at > Time.zone.now
      personal_time.start_at =
        round_to_date(
          points[:fast_personal_point] +
            ((reference_time.start_at - points[:fast_reference_point]) * learning_rate_ema),
          @course_tz
        )
    end
    # Hard limits to make sure we don't fail bounds checks
    personal_time.start_at = [personal_time.start_at, reference_time.start_at, reference_time.end_at].compact.min
  end

  def reset_or_shift_end_at(personal_time, reference_time, points, open_and_straggling) # rubocop:disable Metrics/AbcSize
    return unless personal_time.end_at && personal_time.end_at > Time.zone.now

    unless @slow_down_ratio && points[:slow_reference_point]
      personal_time.end_at = reference_time.end_at
      return
    end

    new_end_at = round_to_date(
      points[:slow_personal_point] +
        ((reference_time.end_at - points[:slow_reference_point]) * [@slow_down_ratio, MAX_OVERALL_LIMIT].min),
      @course_tz,
      to_2359: true # rubocop:disable Naming/VariableNumber
    )
    # Hard limits to make sure we don't fail bounds checks
    new_end_at = [new_end_at, reference_time.end_at, reference_time.start_at].compact.max

    # If the item is already open and straggling, we will only allow the deadline to shift back, not forwards
    personal_time.end_at = new_end_at if !open_and_straggling || new_end_at > personal_time.end_at
  end

  # METHODS SPECIFIC TO THE SLOW LEARNER

  def execute_slow_learner(course_user, precomputed_data, items_to_shift) # rubocop:disable Metrics/AbcSize, Metrics/MethodLength
    points = initial_points(precomputed_data)
    has_sped_up = !precomputed_data[:mean_past_learning_rate].nil? &&
                  precomputed_data[:learning_rate_ema] < precomputed_data[:mean_past_learning_rate]
    @speed_up_ratio = (precomputed_data[:learning_rate_ema] / precomputed_data[:mean_past_learning_rate] if has_sped_up)

    course_user.transaction do
      precomputed_data[:items].each do |item|
        points = update_points(course_user, item, precomputed_data[:submitted_items], points)
        next if cannot_shift_item(course_user, item, precomputed_data[:submitted_items], points[:slow_reference_point],
                                  items_to_shift)

        reference_time = item.reference_time_for(course_user)
        personal_time = item.find_or_create_personal_time_for(course_user)
        reset_or_shift_start_at(personal_time, reference_time, points)
        reset_bonus_end_at(personal_time, reference_time)
        shift_end_at(personal_time, reference_time, points, precomputed_data[:learning_rate_ema])
        personal_time.save!
      end
    end
  end

  def reset_or_shift_start_at(personal_time, reference_time, points)
    return unless personal_time.start_at > Time.zone.now

    unless @speed_up_ratio
      personal_time.start_at = reference_time.start_at
      return
    end

    new_start_at = round_to_date(
      points[:fast_personal_point] + ((reference_time.start_at - points[:fast_reference_point]) * [@speed_up_ratio,
                                                                                                   MIN_OVERALL_LIMIT].max),
      @course_tz,
      to_2359: true # rubocop:disable Naming/VariableNumber
    )
    # Hard limits to make sure we don't fail bounds checks
    personal_time.start_at = [new_start_at, reference_time.start_at, reference_time.end_at].compact.min
  end

  def shift_end_at(personal_time, reference_time, points, learning_rate_ema)
    return unless reference_time.end_at.present?

    new_end_at = round_to_date(
      points[:slow_personal_point] + ((reference_time.end_at - points[:slow_reference_point]) * learning_rate_ema),
      @course_tz,
      to_2359: true # rubocop:disable Naming/VariableNumber
    )
    # Hard limits to make sure we don't fail bounds checks
    new_end_at = [new_end_at, reference_time.end_at, reference_time.start_at].compact.max

    # We don't want to shift the end_at forward if the item is already opened or if the deadline
    # has already passed. Backwards is ok.
    # Assumption: end_at is >= start_at
    return unless new_end_at > personal_time.end_at || personal_time.start_at > Time.zone.now

    personal_time.end_at = new_end_at
  end

  # SHARED METHODS

  def initial_points(precomputed_data)
    fast_reference_point = fast_personal_point = precomputed_data[:items].first.reference_time_for(course_user).start_at
    slow_reference_point = slow_personal_point = precomputed_data[:items].first.reference_time_for(course_user).end_at
    { fast_reference_point: fast_reference_point, fast_personal_point: fast_personal_point,
      slow_reference_point: slow_reference_point, slow_personal_point: slow_personal_point }
  end

  def update_points(course_user, item, submitted_items, points)
    if item.affects_personal_times? && item.id.in?(submitted_items.keys)
      points[:fast_reference_point] = item.reference_time_for(course_user).start_at
      points[:fast_personal_point] = item.time_for(course_user).start_at

      if item.reference_time_for(course_user).end_at.present?
        points[:slow_reference_point] = item.reference_time_for(course_user).end_at
        points[:slow_personal_point] = item.time_for(course_user).end_at
      end
    end

    points
  end

  def cannot_shift_item(course_user, item, submitted_items, reference_point, items_to_shift)
    !item.has_personal_times? || item.id.in?(submitted_items.keys) || item.personal_time_for(course_user)&.fixed? ||
      reference_point.nil? || (!items_to_shift.nil? && !items_to_shift.include?(item.id))
  end

  def reset_bonus_end_at(personal_time, reference_time)
    return unless personal_time.bonus_end_at && personal_time.bonus_end_at > Time.zone.now

    personal_time.bonus_end_at = reference_time.bonus_end_at
  end
end
