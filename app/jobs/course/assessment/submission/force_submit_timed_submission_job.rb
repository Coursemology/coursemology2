# frozen_string_literal: true
# This job performs the force submission for timed assessment
class Course::Assessment::Submission::ForceSubmitTimedSubmissionJob < ApplicationJob
  include TrackableJob
  include Rails.application.routes.url_helpers

  protected

  def perform_tracked(assessment, submission_id, submitter)
    instance = Course.unscoped { assessment.course.instance }

    ActsAsTenant.with_tenant(instance) do
      submission = Course::Assessment::Submission.find_by(id: submission_id, workflow_state: 'attempting')
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
