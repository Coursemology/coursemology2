# frozen_string_literal: true
class Course::Assessment::Submission::DeletingJob < ApplicationJob
  include TrackableJob
  include Rails.application.routes.url_helpers

  protected

  def perform_tracked(deleter, submission_ids, assessment)
    instance = Course.unscoped { assessment.course.instance }
    ActsAsTenant.with_tenant(instance) do
      submissions = assessment.submissions.find(submission_ids)
      delete_submission(assessment, submissions, deleter)
    end
  end

  private

  # Delete all submissions for a given assessment.
  #
  # @param [Course::Assessment] assessment Assessment of which its submissions to be deleted
  # @param [Course::Assessment::Submissions] submissions Submissions that are to be deleted.
  # @param [User] deleter The user object who would be deleting the submission.
  def delete_submission(assessment, submissions, deleter)
    User.with_stamper(deleter) do
      Course::Assessment::Submission.transaction do
        reset_question_bundle_assignments(assessment, submissions) if assessment.randomization == 'prepared'

        creator_ids = []
        submissions.each do |submission|
          submission.destroy!
          creator_ids << submission.creator_id
        end

        Course::Assessment::Submission::MonitoringService.destroy_all_by(assessment, creator_ids)
      end
    end
  end

  # Remove submission ids from question bundle assignments that are related to the deleted submissions.
  #
  # @param [Course::Assessment] assessment Assessment of which its submissions to be deleted
  # @param [Course::Assessment::Submissions] submissions Submissions that are to be deleted.
  def reset_question_bundle_assignments(assessment, submissions)
    submission_ids = submissions.pluck(:id)
    qbas = assessment.question_bundle_assignments.where('submission_id in (?)', submission_ids).lock!
    raise ActiveRecord::Rollback unless qbas.update_all(submission_id: nil)
  end
end
