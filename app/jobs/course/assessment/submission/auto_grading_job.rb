# frozen_string_literal: true
class Course::Assessment::Submission::AutoGradingJob < ApplicationJob
  include TrackableJob
  include Rails.application.routes.url_helpers

  protected

  # Performs the auto grading.
  #
  # @param [Course::Assessment::Submission] submission The object to store the grading
  #   results into.
  # @param [Boolean] only_ungraded Whether grading should be done ONLY for
  #   ungraded_answers, or for all answers regardless of workflow state
  def perform_tracked(submission, only_ungraded = false) # rubocop:disable Style/OptionalBooleanParameter
    instance = Course.unscoped { submission.assessment.course.instance }
    ActsAsTenant.with_tenant(instance) do
      Course::Assessment::Submission::AutoGradingService.grade(submission, only_ungraded: only_ungraded)
      redirect_to(edit_course_assessment_submission_path(submission.assessment.course,
                                                         submission.assessment, submission))
    end
  end
end
