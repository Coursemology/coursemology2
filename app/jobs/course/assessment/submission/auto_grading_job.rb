# frozen_string_literal: true
class Course::Assessment::Submission::AutoGradingJob < ApplicationJob
  include TrackableJob
  include Rails.application.routes.url_helpers

  protected

  # Performs the auto grading.
  #
  # @param [Course::Assessment::Submission] submission The object to store the grading
  #   results into.
  def perform_tracked(submission)
    instance = Course.unscoped { submission.assessment.course.instance }
    ActsAsTenant.with_tenant(instance) do
      Course::Assessment::Submission::AutoGradingService.grade(submission)
      redirect_to(edit_course_assessment_submission_path(submission.assessment.course,
                                                         submission.assessment, submission))
    end
  end
end
