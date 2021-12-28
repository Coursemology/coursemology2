# frozen_string_literal: true
module Course::LessonPlan::PersonalizationConcern
  extend ActiveSupport::Concern

  FOMO_LEARNING_RATE_MAX = 1.0
  FOMO_LEARNING_RATE_MIN = 0.67
  FOMO_LEARNING_RATE_HARD_MIN = 0.5 # No matter how doomed the student is, refuse to go faster than this
  FOMO_DATE_ROUNDING_THRESHOLD = 0.8

  STRAGGLERS_LEARNING_RATE_MAX = 2.0
  STRAGGLERS_LEARNING_RATE_MIN = 1.0
  STRAGGLERS_LEARNING_RATE_HARD_MIN = 0.8
  STRAGGLERS_DATE_ROUNDING_THRESHOLD = 0.2
  STRAGGLERS_FIXES = 1

  # Dispatches the call to the correct personalization algorithm
  # If the algorithm takes too long (e.g. voodoo AI magic), it is responsible for scheduling an async job
  def update_personalized_timeline_for(course_user, timeline_algorithm = nil)
    timeline_algorithm ||= course_user.timeline_algorithm
    Rails.cache.delete("course/lesson_plan/personalization_concern/#{course_user.id}")
    send("algorithm_#{timeline_algorithm}", course_user)
  end

  # Fixed timeline: Follow reference timeline
  # Delete all personal times that are not fixed or submitted
  def algorithm_fixed(course_user)
    submitted_lesson_plan_item_ids = lesson_plan_items_submission_time_hash(course_user)
    course_user.personal_times.where(fixed: false).
      where.not(lesson_plan_item_id: submitted_lesson_plan_item_ids.keys).delete_all
  end

  # Some properties for the following algorithms:
  # - We don't shift personal dates that have already passed. This is to prevent items becoming locked
  #   when students are switched between different algos. There are thus quite a few checks for
  #   > Time.zone.now. The only exception is the backwards-shifting of already-past deadlines, which
  #   allows students to slow down their learning more effectively.
  # - We don't shift closing dates forward when the item has already opened for the student. This is to
  #   prevent students from being shocked that their deadlines have shifted forward suddenly.

  def algorithm_otot(course_user)
    learning_rate_ema = retrieve_or_compute_course_user_data(course_user).last
    return if learning_rate_ema.nil?

    # Apply the appropriate algo depending on student's leaning rate
    learning_rate_ema < 1 ? algorithm_fomo(course_user) : algorithm_stragglers(course_user)
  end

  def algorithm_fomo(course_user)
    submitted_lesson_plan_item_ids, items, learning_rate_ema = retrieve_or_compute_course_user_data(course_user)
    return if learning_rate_ema.nil?

    # Constrain learning rate
    effective_min, effective_max = compute_learning_rate_effective_limits(
      course_user, items, submitted_lesson_plan_item_ids, FOMO_LEARNING_RATE_MIN, FOMO_LEARNING_RATE_MAX
    )
    learning_rate_ema = [FOMO_LEARNING_RATE_HARD_MIN, effective_min, [learning_rate_ema, effective_max].min].max

    # Compute personal times for all items
    course_tz = course_user.course.time_zone
    reference_point = items.first.reference_time_for(course_user).start_at
    personal_point = reference_point
    course_user.transaction do
      items.each do |item|
        # Update reference point and personal point
        if item.affects_personal_times? && item.id.in?(submitted_lesson_plan_item_ids.keys)
          reference_point = item.reference_time_for(course_user).start_at
          personal_point = item.time_for(course_user).start_at
        end

        next if !item.has_personal_times? || item.id.in?(submitted_lesson_plan_item_ids.keys) ||
                item.personal_time_for(course_user)&.fixed?

        reference_time = item.reference_time_for(course_user)
        personal_time = item.find_or_create_personal_time_for(course_user)

        # If the user was previously on the stragglers algorithm and just switched over, and has already open
        # items, we want to keep those items as they are
        next if personal_time.end_at > reference_time.end_at && personal_time.start_at < Time.zone.now

        # Update start_at
        if personal_time.start_at > Time.zone.now
          personal_time.start_at =
            round_to_date(
              personal_point + ((reference_time.start_at - reference_point) * learning_rate_ema),
              course_tz,
              FOMO_DATE_ROUNDING_THRESHOLD
            )
        end
        # Hard limits to make sure we don't fail bounds checks
        personal_time.start_at = [personal_time.start_at, reference_time.start_at, reference_time.end_at].compact.min

        # Update bonus_end_at
        if personal_time.bonus_end_at && personal_time.bonus_end_at > Time.zone.now
          personal_time.bonus_end_at = reference_time.bonus_end_at
        end

        # Update end_at
        personal_time.end_at = reference_time.end_at if personal_time.end_at && personal_time.end_at > Time.zone.now

        personal_time.save!
      end
    end
  end

  def algorithm_stragglers(course_user)
    submitted_lesson_plan_item_ids, items, learning_rate_ema = retrieve_or_compute_course_user_data(course_user)
    return if learning_rate_ema.nil?

    # Constrain learning rate
    effective_min, effective_max = compute_learning_rate_effective_limits(
      course_user, items, submitted_lesson_plan_item_ids, STRAGGLERS_LEARNING_RATE_MIN, STRAGGLERS_LEARNING_RATE_MAX
    )
    learning_rate_ema = [STRAGGLERS_LEARNING_RATE_HARD_MIN, effective_min, [learning_rate_ema, effective_max].min].max

    # Compute personal times for all items
    course_tz = course_user.course.time_zone
    reference_point = items.first.reference_time_for(course_user).end_at
    personal_point = reference_point
    course_user.transaction do
      items.each do |item|
        # Update reference point and personal point
        if item.affects_personal_times? && item.id.in?(submitted_lesson_plan_item_ids.keys) &&
           item.reference_time_for(course_user).end_at.present?
          reference_point = item.reference_time_for(course_user).end_at
          personal_point = item.time_for(course_user).end_at
        end

        next if !item.has_personal_times? || item.id.in?(submitted_lesson_plan_item_ids.keys) ||
                item.personal_time_for(course_user)&.fixed? || reference_point.nil?

        reference_time = item.reference_time_for(course_user)
        personal_time = item.find_or_create_personal_time_for(course_user)

        # Update start_at
        personal_time.start_at = reference_time.start_at if personal_time.start_at > Time.zone.now

        # Update bonus_end_at
        if personal_time.bonus_end_at && personal_time.bonus_end_at > Time.zone.now
          personal_time.bonus_end_at = reference_time.bonus_end_at
        end

        # Update end_at
        if reference_time.end_at.present?
          new_end_at = round_to_date(
            personal_point + ((reference_time.end_at - reference_point) * learning_rate_ema),
            course_tz,
            STRAGGLERS_DATE_ROUNDING_THRESHOLD,
            to_2359: true
          )
          # Hard limits to make sure we don't fail bounds checks
          new_end_at = [new_end_at, reference_time.end_at, reference_time.start_at].compact.max

          # We don't want to shift the end_at forward if the item is already opened or if the deadline
          # has already passed. Backwards is ok.
          # Assumption: end_at is >= start_at
          if new_end_at > personal_time.end_at || personal_time.start_at > Time.zone.now
            personal_time.end_at = new_end_at
          end
        end
        personal_time.save!
      end
    end

    # Fix next few items
    items.select { |item| item.has_personal_times? && !item.id.in?(submitted_lesson_plan_item_ids.keys) }.
      slice(0, STRAGGLERS_FIXES).
      each { |item| item.reload.find_or_create_personal_time_for(course_user).update(fixed: true) }
  end

  # Returns cached data for the course user, if available, else it does the necessary computations and caches.
  # Data returned is an array containing:
  # - The submitted lesson plan item IDs
  # - The published lesson plan items with reference and personal times, sorted by start_at for user
  # - Learning rate computed for the user
  # in the above order.
  def retrieve_or_compute_course_user_data(course_user)
    Rails.cache.fetch("course/lesson_plan/personalization_concern/#{course_user.id}", expires_in: 1.hours) do
      submitted_lesson_plan_item_ids = lesson_plan_items_submission_time_hash(course_user)
      items = course_user.course.lesson_plan_items.published.
              with_reference_times_for(course_user).
              with_personal_times_for(course_user).
              to_a
      items = items.sort_by { |x| x.time_for(course_user).start_at }
      items_affects_personal_times = items.select(&:affects_personal_times?)

      learning_rate_ema = compute_learning_rate_ema(
        course_user, items_affects_personal_times, submitted_lesson_plan_item_ids
      )
      [submitted_lesson_plan_item_ids, items, learning_rate_ema]
    end
  end

  # Returns { lesson_plan_item_id => submitted_time or nil }
  # If the lesson plan item is a key in this hash then we consider the item "submitted" regardless of whether we have a
  # submission time for it.
  def lesson_plan_items_submission_time_hash(course_user)
    lesson_plan_items_submission_time_hash = {}

    # Assessments - consider submitted only if submitted_at is present
    lesson_plan_items_submission_time_hash.merge!(
      course_user.course.assessments.
      with_submissions_by(course_user.user).
      select { |x| x.submissions.present? && x.submissions.first.submitted_at.present? }.
      map { |x| [x.lesson_plan_item.id, x.submissions.first.submitted_at] }.to_h
    )

    # Videos - consider submitted as long as submission exists
    lesson_plan_items_submission_time_hash.merge!(
      course_user.course.videos.
      with_submissions_by(course_user.user).
      select { |x| x.submissions.present? }.
      map { |x| [x.lesson_plan_item.id, nil] }.to_h
    )
  end

  # Min/max overall learning rate refers to how early/late a student is allowed to complete the course.
  #
  # E.g. if max_overall_lr = 2 means a student is allowed to complete a 1-month course over 2 months.
  # However, if the student somehow managed to complete half of the course within the first day, then we can allow him
  # to continue at lr = 4 and still have the student complete the course over 2 months. This method computes the
  # effective limits to preserve the overall min/max lr.
  #
  # NOTE: It is completely possible for negative results (even -infinity), i.e. student needs to go back in time in
  # order to have any hope of completing the course within the limits. The algorithm needs to take care of this.
  def compute_learning_rate_effective_limits(
    course_user, items, submitted_lesson_plan_item_ids, min_overall_learning_rate, max_overall_learning_rate
  )
    course_start = items.first.start_at
    course_end = items.last.start_at
    last_submitted_item =
      items.reverse_each.lazy.
      select { |item| item.affects_personal_times? && item.id.in?(submitted_lesson_plan_item_ids.keys) }.first
    return [min_overall_learning_rate, max_overall_learning_rate] if last_submitted_item.nil?

    reference_remaining_time = items.last.start_at - last_submitted_item.reference_time_for(course_user).start_at
    min_personal_remaining_time =
      course_start +
      (min_overall_learning_rate * (course_end - course_start)) - last_submitted_item.time_for(course_user).start_at
    max_personal_remaining_time =
      course_start +
      (max_overall_learning_rate * (course_end - course_start)) - last_submitted_item.time_for(course_user).start_at

    [min_personal_remaining_time / reference_remaining_time, max_personal_remaining_time / reference_remaining_time]
  end

  # Exponential Moving Average (EMA) of the learning rate
  def compute_learning_rate_ema(course_user, course_assessments, submitted_lesson_plan_item_ids, alpha = 0.4)
    submitted_assessments = course_assessments.
                            select { |x| x.id.in? submitted_lesson_plan_item_ids.keys }.
                            select { |x| x.time_for(course_user).end_at.present? }.
                            sort_by { |x| x.time_for(course_user).start_at }
    return nil if submitted_assessments.empty?

    learning_rate_ema = 1.0
    submitted_assessments.each do |assessment|
      times = assessment.time_for(course_user)
      next if times.end_at - times.start_at == 0 || submitted_lesson_plan_item_ids[assessment.id].nil?

      learning_rate = (submitted_lesson_plan_item_ids[assessment.id] - times.start_at) / (times.end_at - times.start_at)
      learning_rate = [learning_rate, 0].max
      learning_rate_ema = (alpha * learning_rate) + ((1 - alpha) * learning_rate_ema)
    end
    learning_rate_ema
  end

  private

  # Round to "nearest" date in course's timezone, NOT user's timezone.
  #
  # @param [Time] datetime The datetime object to round.
  # @param [String] course_tz The timezone of the course.
  # @param [Float] threshold How generously we round off. E.g. if `threshold` = 0.8, then a datetime with a time of
  #                          > 0.8 * 1.day will be snapped to the next day.
  # @param [Boolean] to_2359 Whether to round off to 2359. This will set the datetime to be 2359 of the date before the
  #                          rounded date.
  def round_to_date(datetime, course_tz, threshold = 0.5, to_2359: false)
    prev_day = datetime.in_time_zone(course_tz).to_date.in_time_zone(course_tz).in_time_zone
    date = ((datetime - prev_day) < threshold ? prev_day : prev_day + 1.day)
    to_2359 ? date - 1.minute : date
  end
end
