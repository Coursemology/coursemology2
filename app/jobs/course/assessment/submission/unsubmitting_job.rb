# frozen_string_literal: true
# This job comprises of 2 tasks: 1) unsubmitting submissions and 2) (Optional) deleting answers to a specific question
# of the unsubmitted submissions

class Course::Assessment::Submission::UnsubmittingJob < ApplicationJob
  include TrackableJob
  include Rails.application.routes.url_helpers

  protected

  # Creates a job to unsubmit all submitted submissions for a given assessment
  # and to optionally delete answers to a question.
  #
  # @param [User] unsubmitter User who creates the unsubmission job.
  # @param [Array<Integer>] submission_ids Submission ids of the submissions that are to be unsubmitted.
  # @param [Course::Assessment] assessment Assessment of the submissions.
  # @param [Course::Assessment::Question] question Optional question that should have its answers deleted.
  # @param [String] redirect_to_path Path to be redirected after the job is completed.
  def perform_tracked(unsubmitter, submission_ids, assessment, question = nil, redirect_to_path = nil)
    instance = Course.unscoped { assessment.course.instance }
    ActsAsTenant.with_tenant(instance) do
      submissions = assessment.submissions.find(submission_ids)
      unsubmit_submission(submissions, question, unsubmitter)
    end

    redirect_to redirect_to_path
  end

  private

  # Unsubmit all submitted submissions for a given assessment and delete answer to question.
  #
  # @param [Course::Submissions] submissions Submissions that are to be unsubmitted.
  # @param [Course::Assessment::Question] question Optional question that should have its answers deleted.
  # @param [User] unsubmitter The user object who would be unsubmitting the submission.
  def unsubmit_submission(submissions, question, unsubmitter)
    User.with_stamper(unsubmitter) do
      Course::Assessment::Submission.transaction do
        submissions.each do |submission|
          submission.update('unmark' => 'true') if submission.graded?
          submission.update('unsubmit' => 'true') unless submission.attempting?
        end
        question&.answers&.destroy_all
      end
    end
  end
end
