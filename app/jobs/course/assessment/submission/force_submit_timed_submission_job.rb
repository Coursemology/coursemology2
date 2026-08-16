# frozen_string_literal: true
# Force-submits a single submission once its force-submit time (time-limit expiry or effective
# deadline, whichever is earlier) has passed. Scheduled at creation for submissions falling due
# within the scheduling horizon, and enqueued by ScheduleExpiringSubmissionsJob for submissions found
# imminent or overdue. It re-checks the live state when it runs, so a deadline extended after
# the job was scheduled, or a submission the student finalised first, is left untouched.
class Course::Assessment::Submission::ForceSubmitTimedSubmissionJob < ApplicationJob
  include TrackableJob
  include Rails.application.routes.url_helpers

  protected

  def perform_tracked(assessment, submission_id)
    instance = Course.unscoped { assessment.course.instance }

    ActsAsTenant.with_tenant(instance) do
      submission = Course::Assessment::Submission.find_by(id: submission_id)
      return unless submission&.attempting?

      # The deadline may have been extended after this job was scheduled; only submit once actually due.
      force_submit_at = submission.force_submit_at
      return if force_submit_at.nil? || force_submit_at > Time.zone.now

      submission.force_submit!
    end
  end
end
