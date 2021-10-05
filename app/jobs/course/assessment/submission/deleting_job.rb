# frozen_string_literal: true
class Course::Assessment::Submission::DeletingJob < ApplicationJob
  include TrackableJob
  include Rails.application.routes.url_helpers

  protected

  def perform_tracked(deleter, submission_ids, assessment)
    instance = Course.unscoped { assessment.course.instance }
    ActsAsTenant.with_tenant(instance) do
      submissions = assessment.submissions.find(submission_ids)
      delete_submission(submissions, deleter)
    end

    redirect_to course_assessment_submissions_path(assessment.course, assessment)
  end

  private

  # Delete all submissions for a given assessment.
  #
  # @param [Course::Submissions] submissions Submissions that are to be deleted.
  # @param [User] deleter The user object who would be deleting the submission.
  def delete_submission(submissions, deleter)
    User.with_stamper(deleter) do
      Course::Assessment::Submission.transaction do
        submissions.each do |submission|
          submission.update('unmark' => 'true') if submission.graded?
          submission.update('unsubmit' => 'true') unless submission.attempting?
          submission.destroy!
        end
      end
    end
  end
end
