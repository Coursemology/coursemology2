# frozen_string_literal: true
module Course::LessonPlan::PersonalizationConcern
  extend ActiveSupport::Concern

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

  # TODO: Implement something smarter
  # For now, copy over reference timeline to personal timeline + fix next 3 items
  def algorithm_naive(course_user)
    submissions = retrieve_submissions(course_user)
    submitted_ids = submissions.keys.select { |k| submissions[k].submitted_at.present? }
    course_assessments = course_user.course.lesson_plan_items.where(actable_type: Course::Assessment.name).
                         with_reference_times_for(course_user).
                         with_personal_times_for(course_user).
                         to_a
    course_user.transaction do
      course_assessments.each do |course_assessment|
        personal_time = course_assessment.personal_time_for(course_user)

        # Skip committed or submitted items
        next if personal_time.present? && (personal_time.fixed? || course_assessment.id.in?(submitted_ids))

        # Copy over from reference time
        personal_time = course_assessment.find_or_create_personal_time_for(course_user)
        personal_time.save! if personal_time.changed?
      end

      # Get next three unsubmitted items and mark as fixed
      course_assessments = Course::LessonPlan::Item.where(id: course_assessments).
                           with_reference_times_for(course_user).
                           with_personal_times_for(course_user).
                           to_a
      course_assessments = course_assessments.select do |course_assessment|
        personal_time = course_assessment.personal_time_for(course_user)
        personal_time.nil? || course_assessment.id.in?(submitted_ids)
      end
      course_assessments = course_assessments.sort_by { |x| x.time_for(course_user) }
      course_assessments.slice(0, 3).each do |course_assessment|
        personal_time = course_assessment.personal_time_for(course_user)
        personal_time.fixed = true
        personal_time.save! if personal_time.changed?
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
end
