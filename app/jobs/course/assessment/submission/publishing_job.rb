# frozen_string_literal: true
class Course::Assessment::Submission::PublishingJob < ApplicationJob
  include TrackableJob
  include Rails.application.routes.url_helpers

  protected

  def perform_tracked(graded_submission_ids, assessment, publisher)
    instance = Course.unscoped { assessment.course.instance }
    ActsAsTenant.with_tenant(instance) do
      submissions = assessment.submissions.find(graded_submission_ids)
      publish_submissions(submissions, publisher)
    end

    redirect_to course_assessment_submissions_path(assessment.course, assessment)
  end

  private

  # Publishes all graded submissions for a given assessment.
  #
  # @param [Course::Assessment] assessment The assessment for which the submissions' grades are
  # to be published for.
  # @param [User] publisher The user object who would be publishing the submission.
  def publish_submissions(submissions, publisher)
    User.with_stamper(publisher) do
      Course::Assessment::Submission.transaction do
        submissions.each do |submission|
          submission.publish!
          submission.save!
        end
      end
    end
  end
end
