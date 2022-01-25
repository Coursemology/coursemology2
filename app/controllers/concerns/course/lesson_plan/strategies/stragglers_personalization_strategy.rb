# frozen_string_literal: true
class Course::LessonPlan::Strategies::StragglersPersonalizationStrategy <
  Course::LessonPlan::Strategies::BasePersonalizationStrategy
  MIN_LEARNING_RATE = 1.0
  MAX_LEARNING_RATE = 2.0
  HARD_MIN_LEARNING_RATE = 0.8
  DATE_ROUNDING_THRESHOLD = 0.2
  STRAGGLERS_FIXES = 1

  # Shifts end_at of relevant lesson plan items and resets the bonus_end_at and start_at
  # of the same items. The amount shifted is based the learning rate precomputed.
  #
  # The expected precomputed_data is the default data from precompute_data.
  #
  # @param [CourseUser] course_user The user to adjust the personalized timeline for.
  # @param [Hash] precomputed_data The default data precomputed by precompute_data.
  def execute(course_user, precomputed_data) # rubocop:disable Metrics/AbcSize, Metrics/MethodLength
    return if precomputed_data[:learning_rate_ema].nil?

    @course_tz = course_user.course.time_zone
    reference_point = personal_point = precomputed_data[:items].first.reference_time_for(course_user).end_at
    course_user.transaction do
      precomputed_data[:items].each do |item|
        reference_point, personal_point = update_points(course_user, item, precomputed_data[:submitted_items],
                                                        reference_point, personal_point)
        next if cannot_shift_item(course_user, item, precomputed_data[:submitted_items], reference_point)

        reference_time = item.reference_time_for(course_user)
        personal_time = item.find_or_create_personal_time_for(course_user)
        reset_start_at(personal_time, reference_time)
        reset_bonus_end_at(personal_time, reference_time)
        shift_end_at(personal_time, reference_time, personal_point, reference_point,
                     precomputed_data[:learning_rate_ema])
        personal_time.save!
      end
    end

    fix_items(course_user, precomputed_data[:items], precomputed_data[:submitted_items])
  end

  private

  # Checks if the given item should act as the most recent "anchor point" for the following shifts.
  # If the item should act, returns an array [new_reference_point, new_personal_point] computed with that item.
  # If the item should not act, then the original reference_point and personal_point will be returned.
  #
  # @param [CourseUser] course_user The user to update points for for.
  # @param [Course::LessonPlan::Item] item The item to reference for the update of points.
  # @param [Hash{Integer=>ActiveSupport::TimeWithZone|nil}] submitted_items A hash of submitted lesson plan items' ID to
  #   their submitted time, if relevant/available.
  # @param [DateTime] reference_point The current reference_point.
  # @param [DateTime] personal_point The current personal_point.
  # @return [Array<ActiveSupport::TimeWithZone>] An array containing [new_reference_point, new_personal_point].
  def update_points(course_user, item, submitted_items, reference_point, personal_point)
    if item.affects_personal_times? && item.id.in?(submitted_items.keys) &&
       item.reference_time_for(course_user).end_at.present?
      return [item.reference_time_for(course_user).end_at, item.time_for(course_user).end_at]
    end

    [reference_point, personal_point]
  end

  # Checks if the lesson plan item cannot be shifted. If cannot, the timings for this item will not be adjusted.
  # Currently, it checks for the following conditions, for it to be possible to be shifted:
  # - Item has personal times
  # - Item is not submitted
  # - Item's personal time isn't fixed
  # - There is an existing reference_point computed from the most recent submission.
  #
  # @param [CourseUser] course_user The user whose item we are checking.
  # @param [Course::LessonPlan::Item] item The item that we are checking.
  # @param [Hash{Integer=>ActiveSupport::TimeWithZone|nil}] submitted_items A hash of submitted lesson plan items' ID
  #   to their submitted time, if relevant/available.
  # @param [Course::ReferenceTime] reference_time Current reference time to be checked.
  # @return [Boolean] Whether the item cannot be shifted.
  def cannot_shift_item(course_user, item, submitted_items, reference_point)
    !item.has_personal_times? || item.id.in?(submitted_items.keys) ||
      item.personal_time_for(course_user)&.fixed? || reference_point.nil?
  end

  # Resets the start_at of the personal_time to that of the reference_time.
  # The personal time's current start_at timing must also be in the future.
  #
  # @param [Course::PersonalTime] personal_time Personal time that we are resetting.
  # @param [Course::ReferenceTime] reference_time Reference time that we are using as reference.
  def reset_start_at(personal_time, reference_time)
    return unless personal_time.start_at > Time.zone.now

    personal_time.start_at = reference_time.start_at
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

  # Shifts the end_at of the personal_time backward based on the learning rate of the user and the most recent
  # personal and reference points. This major shift only occurs if the personal_time's current end_at is in the
  # future.
  #
  # In addition, it also handles the case where the reference_time's end_at has shifted backward, as the
  # end_at of the personal_time will never be earlier than the end_at of the reference time.
  #
  # @param [Course::PersonalTime] personal_time Personal time that we are shifting.
  # @param [Course::ReferenceTime] reference_time Reference time that we are referring.
  # @param [ActiveSupport::TimeWithZone] personal_point Personal point from the most recent item.
  # @param [ActiveSupport::TimeWithZone] reference_point Reference point from the most recent item.
  # @param [Float] learning_rate_ema Learning rate to use for computing the shift amount.
  def shift_end_at(personal_time, reference_time, personal_point, reference_point, learning_rate_ema)
    return unless reference_time.end_at.present?

    new_end_at = round_to_date(
      personal_point + ((reference_time.end_at - reference_point) * learning_rate_ema),
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

  # Fixes the next few items for the student, such that their deadlines will no longer be automatically modified on
  # further timeline recomputations.
  # This guarantee allows students to plan their time accordingly such that they will not be surprised if the deadline
  # suddenly moves forward, nor will they be able to use this as an excuse to appeal for an extension.
  #
  # @param [CourseUser] course_user User to fix items for.
  # @param [Array<Course::LessonPlan::Item>] items Sorted array of lesson plan items based on the course_user's
  #   start_at,
  # @param [Hash{Integer=>ActiveSupport::TimeWithZone|nil}] submitted_items A hash of submitted lesson plan items' ID
  #   to their submitted time, if relevant/available.
  def fix_items(course_user, items, submitted_items)
    items.select { |item| item.has_personal_times? && !item.id.in?(submitted_items.keys) }.
      slice(0, self.class::STRAGGLERS_FIXES).
      each { |item| item.reload.find_or_create_personal_time_for(course_user).update(fixed: true) }
  end
end
