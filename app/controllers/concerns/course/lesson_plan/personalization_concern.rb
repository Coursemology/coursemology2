# frozen_string_literal: true
module Course::LessonPlan::PersonalizationConcern
  extend ActiveSupport::Concern

  OTOT_LEARNING_RATE_MAX = 1.0
  OTOT_LEARNING_RATE_MIN = 0.5
  OTOT_DATE_ROUNDING_THRESHOLD = 0.8

  # Dispatches the call to the correct personalization algorithm
  # If the algorithm takes too long (e.g. voodoo AI magic), it is responsible for scheduling an async job
  def update_personalized_timeline_for(course_user, timeline_algorithm = nil)
    timeline_algorithm ||= course_user.timeline_algorithm
    send("algorithm_#{timeline_algorithm}", course_user)
  end

  # Fixed timeline: Follow reference timeline
  # Delete all personal times that are not fixed or submitted
  def algorithm_fixed(course_user)
    submissions = retrieve_submissions(course_user)
    submitted_ids = submissions.keys.select { |k| submissions[k].submitted_at.present? }
    course_user.personal_times.where(fixed: false).where.not(lesson_plan_item_id: submitted_ids).delete_all
  end

  def algorithm_otot(course_user)
    course_tz = course_user.course.time_zone
    submissions = retrieve_submissions(course_user)
    submitted_ids = submissions.keys.select { |k| submissions[k].submitted_at.present? }
    items = course_user.course.lesson_plan_items.
            with_reference_times_for(course_user).
            with_personal_times_for(course_user).
            to_a
    items = items.sort_by { |x| x.time_for(course_user).start_at }
    items_affects_personal_times = items.select(&:affects_personal_times?)

    learning_rate_ema = compute_learning_rate_ema(course_user, items_affects_personal_times, submissions)
    return if learning_rate_ema.nil?

    # Constrain lr
    # TODO: Constrain based on overall lr and not instantaneous lr
    learning_rate_ema = [OTOT_LEARNING_RATE_MAX, [learning_rate_ema, OTOT_LEARNING_RATE_MIN].max].min

    # Compute personal times for all items
    reference_point = items.first.reference_time_for(course_user).start_at
    personal_point = reference_point
    course_user.transaction do
      items.each do |item|
        # Update reference point and personal point
        if item.affects_personal_times? && item.id.in?(submitted_ids)
          reference_point = item.reference_time_for(course_user).start_at
          personal_point = item.time_for(course_user).start_at
        end

        next if !item.has_personal_times? || item.id.in?(submitted_ids) || item.personal_time_for(course_user)&.fixed?

        # Update personal time
        reference_time = item.reference_time_for(course_user)
        personal_time = item.find_or_create_personal_time_for(course_user)
        personal_time.start_at =
          round_to_date(
            personal_point + (reference_time.start_at - reference_point) * learning_rate_ema,
            course_tz,
            OTOT_DATE_ROUNDING_THRESHOLD
          )
        # Hard limits to make sure we don't fail bounds checks
        personal_time.start_at = [personal_time.start_at, reference_time.start_at, reference_time.end_at].compact.min
        personal_time.bonus_end_at = reference_time.bonus_end_at
        personal_time.end_at = reference_time.end_at
        personal_time.save!
      end
    end
  end

  private

  # Returns { lesson_plan_item_id => submission }
  def retrieve_submissions(course_user)
    assessments = course_user.course.assessments.
                  with_submissions_by(course_user.user).
                  select { |x| x.submissions.present? }
    assessments.map { |x| [x.lesson_plan_item.id, x.submissions.first] }.to_h
  end

  # Exponential Moving Average (EMA) of the learning rate
  def compute_learning_rate_ema(course_user, course_assessments, submissions, alpha = 0.4)
    submitted_ids = submissions.keys.select { |k| submissions[k].submitted_at.present? }
    submitted_assessments = course_assessments.
                            select { |x| x.id.in? submitted_ids }.
                            select { |x| x.time_for(course_user).end_at.present? }.
                            sort_by { |x| x.time_for(course_user).start_at }
    return nil if submitted_assessments.empty?

    learning_rate_ema = nil
    submitted_assessments.each do |assessment|
      times = assessment.time_for(course_user)
      next if times.end_at - times.start_at == 0

      learning_rate = (submissions[assessment.id].submitted_at - times.start_at) / (times.end_at - times.start_at)
      learning_rate = [learning_rate, 0].max
      learning_rate_ema =
        if learning_rate_ema.nil?
          learning_rate
        else
          alpha * learning_rate + (1 - alpha) * learning_rate_ema
        end
    end
    learning_rate_ema
  end

  # Round to "nearest" date in course's timezone, NOT user's timezone
  # `threshold` allows us to control how generously we snap.
  # E.g. if `threshold` = 0.8, then a datetime with a time of > 0.8 * 1.day will be snapped to the next day
  def round_to_date(datetime, course_tz, threshold = 0.5)
    prev_day = datetime.in_time_zone(course_tz).to_date.in_time_zone(course_tz).in_time_zone
    (datetime - prev_day) < threshold ? prev_day : prev_day + 1.day
  end
end
