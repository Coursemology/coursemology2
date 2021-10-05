# frozen_string_literal: true
class Course::Assessment::Submission::UnsubmittingJob < ApplicationJob
  include TrackableJob
  include Rails.application.routes.url_helpers

  protected

  def perform_tracked(unsubmitter, submission_ids, assessment)
    instance = Course.unscoped { assessment.course.instance }
    ActsAsTenant.with_tenant(instance) do
      submissions = assessment.submissions.find(submission_ids)
      unsubmit_submission(submissions, unsubmitter)
    end

    redirect_to course_assessment_submissions_path(assessment.course, assessment)
  end

  private

  # Unsubmit all submitted submissions for a given assessment.
  #
  # @param [Course::Submissions] submissions Submissions that are to be unsubmitted.
  # @param [User] unsubmitter The user object who would be unsubmitting the submission.
  def unsubmit_submission(submissions, unsubmitter)
    User.with_stamper(unsubmitter) do
      Course::Assessment::Submission.transaction do
        submissions.each do |submission|
          submission.update('unmark' => 'true') if submission.graded?
          submission.update('unsubmit' => 'true') unless submission.attempting?
        end
      end
    end
  end
end
