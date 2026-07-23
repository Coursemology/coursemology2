# frozen_string_literal: true
# This job performs the force submission for timed assessment
class Course::Assessment::Submission::ForceSubmitTimedSubmissionJob < ApplicationJob
  include TrackableJob
  include Rails.application.routes.url_helpers

  protected

  def perform_tracked(assessment, submission_id, submitter)
    instance = Course.unscoped { assessment.course.instance }

    ActsAsTenant.with_tenant(instance) do
      # `submission_id` here is the id `create_force_submission_job` (Attempt#create_force_submission_job)
      # scheduled with, which is `attempt.id` — this job's own param name predates the split and is
      # not renamed here (renaming it is exactly the kind of cosmetic diff the repo's diff-hygiene
      # rule forbids without a functional reason).
      submission = Course::Assessment::Attempt.find_by(id: submission_id)&.submission
      return unless submission

      force_submit(submission, submitter)
    end
  end

  private

  def force_submit(submission, submitter)
    User.with_stamper(submitter) do
      ActiveRecord::Base.transaction do
        submission.update!('finalise' => 'true')
      end
    end
  end
end
