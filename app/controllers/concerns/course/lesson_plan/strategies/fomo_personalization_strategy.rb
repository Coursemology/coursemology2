# frozen_string_literal: true
class Course::LessonPlan::Strategies::FomoPersonalizationStrategy <
  Course::LessonPlan::Strategies::BasePersonalizationStrategy
  MIN_LEARNING_RATE = 0.67
  MAX_LEARNING_RATE = 1.0
  HARD_MIN_LEARNING_RATE = 0.5
  DATE_ROUNDING_THRESHOLD = 0.8

  # Shifts start_at of relevant lesson plan items and resets the bonus_end_at and end_at
  # of the same items. The amount shifted is based the learning rate precomputed.
  #
  # The expected precomputed_data is the default data from precompute_data.
  #
  # @param [CourseUser] course_user The user to adjust the personalized timeline for.
  # @param [Hash] precomputed_data The default data precomputed by precompute_data.
  # @param [Set<Number>|nil] items_to_shift Set of item ids to shift. If provided, only items with ids in this set will
  #   be shifted.
  def execute(course_user, precomputed_data, items_to_shift = nil) # rubocop:disable Metrics/AbcSize, Metrics/MethodLength
    return if precomputed_data[:learning_rate_ema].nil?

    @course_tz = course_user.course.time_zone
    reference_point = personal_point = precomputed_data[:items].first.reference_time_for(course_user).start_at
    course_user.transaction do
      precomputed_data[:items].each do |item|
        reference_point, personal_point = update_points(course_user, item, precomputed_data[:submitted_items],
                                                        reference_point, personal_point)
        next if cannot_shift_item(course_user, item, precomputed_data[:submitted_items], items_to_shift)

        reference_time = item.reference_time_for(course_user)
        personal_time = item.find_or_create_personal_time_for(course_user)
        next if item_is_open_and_straggling(personal_time, reference_time)

        shift_start_at(personal_time, reference_time, personal_point, reference_point,
                       precomputed_data[:learning_rate_ema])
        reset_bonus_end_at(personal_time, reference_time)
        reset_end_at(personal_time, reference_time)
        personal_time.save!
      end
    end
  end

  private

  # Checks if the given item should act as the most recent "anchor point" for the following shifts.
  # If the item should act, returns an array [new_reference_point, new_personal_point] computed with that item.
  # If the item should not act, then the original reference_point and personal_point will be returned.
  #
  # @param [CourseUser] course_user The user to update points for.
  # @param [Course::LessonPlan::Item] item The item to reference for the update of points.
  # @param [Hash{Integer=>ActiveSupport::TimeWithZone|nil}] submitted_items A hash of submitted lesson plan items' ID to
  #   their submitted time, if relevant/available.
  # @param [DateTime] reference_point The current reference_point.
  # @param [DateTime] personal_point The current personal_point.
  # @return [Array<ActiveSupport::TimeWithZone>] An array containing [new_reference_point, new_personal_point].
  def update_points(course_user, item, submitted_items, reference_point, personal_point)
    if item.affects_personal_times? && item.id.in?(submitted_items.keys)
      return [item.reference_time_for(course_user).start_at, item.time_for(course_user).start_at]
    end

    [reference_point, personal_point]
  end

  # Checks if the lesson plan item cannot be shifted. If cannot, the timings for this item will not be adjusted.
  # Currently, it checks for the following conditions, for it to be possible to be shifted:
  # - Item has personal times
  # - Item is not submitted
  # - Item's personal time isn't fixed
  # - Item isn't currently open with an adjusted end_at from stragglers algorithm
  # - Item ID is in the set of items to shift, if provided
  #
  # @param [CourseUser] course_user The user whose item we are checking.
  # @param [Course::LessonPlan::Item] item The item that we are checking.
  # @param [Hash{Integer=>ActiveSupport::TimeWithZone|nil}] submitted_items A hash of submitted lesson plan items' ID
  #   to their submitted time, if relevant/available.
  # @param [Set<Number>|nil] items_to_shift Set of item ids to shift. If provided, only items with ids in this set will
  #   be shifted.
  # @return [Boolean] Whether the item cannot be shifted.
  def cannot_shift_item(course_user, item, submitted_items, items_to_shift)
    !item.has_personal_times? || item.id.in?(submitted_items.keys) || item.personal_time_for(course_user)&.fixed? ||
      (!items_to_shift.nil? && !items_to_shift.include?(item.id))
  end

  def item_is_straggling(personal_time, reference_time)
    if reference_time.end_at.present? && personal_time.end_at.present?
      return reference_time.end_at < personal_time.end_at
    elsif reference_time.end_at.present? && personal_time.end_at.nil?
      return true
    end

    false
  end

  # Checks if the item is already open with a deadline shifted back by stragglers algorithm.
  # If the user was previously on the stragglers algorithm and just switched over, and has already open
  # items, we want to keep those items as they are.
  #
  # @param [Course::PersonalTime] personal_time Personal time that we are checking.
  # @param [Course::ReferenceTime] reference_time Reference time that we are referring.
  # @return [Boolean] Whether the item is already open with a deadline shifted back by stragglers algorithm
  def item_is_open_and_straggling(personal_time, reference_time)
    item_is_straggling = item_is_straggling(personal_time, reference_time)
    item_is_open = personal_time.start_at < Time.zone.now
    item_is_straggling && item_is_open
  end

  # Shifts the start_at of the personal_time forward based on the learning rate of the user and the most recent
  # personal and reference points. This major shift only occurs if the personal_time's current start_at is in the
  # future.
  #
  # In addition, it also handles the case where the reference_time's start_at has shifted forward, as the
  # start_at of the personal_time will never be later than the start_at of the reference time.
  #
  # @param [Course::PersonalTime] personal_time Personal time that we are shifting.
  # @param [Course::ReferenceTime] reference_time Reference time that we are referring.
  # @param [ActiveSupport::TimeWithZone] personal_point Personal point from the most recent item.
  # @param [ActiveSupport::TimeWithZone] reference_point Reference point from the most recent item.
  # @param [Float] learning_rate_ema Learning rate to use for computing the shift amount.
  def shift_start_at(personal_time, reference_time, personal_point, reference_point, learning_rate_ema)
    if personal_time.start_at > Time.zone.now
      personal_time.start_at =
        round_to_date(
          personal_point + ((reference_time.start_at - reference_point) * learning_rate_ema),
          @course_tz
        )
    end
    # Hard limits to make sure we don't fail bounds checks
    personal_time.start_at = [personal_time.start_at, reference_time.start_at, reference_time.end_at].compact.min
  end

  # Resets the bonus_end_at of the personal_time to that of the reference_time if the personal_time has bonus_end_at.
  # The personal time's current bonus_end_at timing must also be in the future.
  #
  # @param [Course::PersonalTime] personal_time Personal time that we are resetting.
  # @param [Course::ReferenceTime] reference_time Reference time that we are using as reference.
  def reset_bonus_end_at(personal_time, reference_time)
    return unless personal_time.bonus_end_at && personal_time.bonus_end_at > Time.zone.now

    personal_time.bonus_end_at = reference_time.bonus_end_at
  end

  # Resets the end_at of the personal_time to that of the reference_time if the personal_time has end_at.
  # The personal time's current end_at timing must also be in the future.
  #
  # @param [Course::PersonalTime] personal_time Personal time that we are resetting.
  # @param [Course::ReferenceTime] reference_time Reference time that we are using as reference.
  def reset_end_at(personal_time, reference_time)
    return unless personal_time.end_at && personal_time.end_at > Time.zone.now

    personal_time.end_at = reference_time.end_at
  end
end
