# frozen_string_literal: true
# Periodic sweep (see config/schedule.yml) that schedules force-submit jobs for attempting
# submissions whose force-submit time is imminent. Most submissions are scheduled directly when they
# are created (within FORCE_SUBMIT_SCHEDULING_HORIZON of their force-submit time); this sweep covers
# the rest: long-lived attempts created further ahead than the horizon, and past-due submissions
# whose scheduled job was lost.
#
# It schedules a precise, future-dated ForceSubmitTimedSubmissionJob (preserving minute-granularity)
# rather than force-submitting inline. Each submission records the force-submit time it was scheduled
# for, so a submission already scheduled for its current time is skipped (letting the window be wide
# and the run infrequent) while one whose deadline changed, or whose job was lost, is rescheduled.
class Course::Assessment::Submission::ScheduleExpiringSubmissionsJob < ApplicationJob
  # How far ahead the sweep looks.
  SCHEDULE_WINDOW = Course::Assessment::Submission::FORCE_SUBMIT_SCHEDULING_HORIZON + 30.minutes

  rescue_from(ActiveJob::DeserializationError) do |_|
    # Prevent the job from retrying due to deleted records.
  end

  def perform
    ActsAsTenant.without_tenant do
      candidate_submissions.find_each { |submission| schedule(submission) }
    end
  end

  private

  # Attempting submissions that have a force-submit time (a time limit, or deadline enforcement) and
  # are not exempt. The precise force-submit time needs each submitter's personalised deadline, so the
  # imminence test is applied in Ruby — hence the eager loads of the timeline records that
  # +Course::LessonPlan::Item#time_for+ reads, to avoid an N+1 across submissions.
  def candidate_submissions
    Course::Assessment::Submission.with_attempting_state.
      joins(:assessment).merge(Course::Assessment.to_force_submit).
      where(unsubmitted_at: nil).
      includes(experience_points_record: :course_user,
               assessment: {
                 lesson_plan_item: [:personal_times, :reference_times, course: :default_reference_timeline]
               })
  end

  def schedule(submission)
    force_submit_at = submission.force_submit_at
    return if force_submit_at.nil? || force_submit_at > Time.zone.now + SCHEDULE_WINDOW

    # Skip when a job is already scheduled for the current force-submit time and it has not yet come
    # due. A submission whose deadline (or personal time) changed no longer matches its recorded time
    # and is rescheduled; a past-due one (whose job was lost) is rescheduled immediately.
    return if submission.force_submit_job_scheduled? && !submission.force_submit_overdue?

    submission.enqueue_force_submit_job
  end
end
