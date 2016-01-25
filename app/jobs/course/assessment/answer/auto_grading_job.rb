class Course::Assessment::Answer::AutoGradingJob < ApplicationJob
  include TrackableJob
  include Rails.application.routes.url_helpers

  protected

  # Performs the auto grading.
  #
  # @param [Course::Assessment::Answer::AutoGrading] auto_grading The object to store the grading
  #   results into.
  def perform_tracked(auto_grading)
    instance = nil
    submission = auto_grading.answer.submission

    Course.unscoped do
      instance = submission.assessment.course.instance
    end
    ActsAsTenant.with_tenant(instance) do
      Course::Assessment::Answer::AutoGradingService.grade(auto_grading)
      redirect_to(edit_course_assessment_submission_path(submission.assessment.course,
                                                         submission.assessment, submission))
    end
  end
end
