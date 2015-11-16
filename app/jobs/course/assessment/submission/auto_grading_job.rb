class Course::Assessment::Submission::AutoGradingJob < ApplicationJob
  include TrackableJob
  include Rails.application.routes.url_helpers

  # The Submission Auto Grading Job needs to be the lowest priority, because it will fire off
  # answer auto grading jobs. If this is at an equal or higher priority than the answer auto
  # grading job, then it is possible that the answer auto grading jobs might never get to run,
  # and then the submission auto grading jobs will never return.
  #
  # Raising this *will* eventually cause a deadlock.
  queue_as :lowest

  protected

  # Performs the auto grading.
  #
  # @param [Course::Assessment::Submission] submission The object to store the grading
  #   results into.
  def perform_tracked(submission)
    instance = nil
    Course.unscoped do
      instance = submission.assessment.course.instance
    end
    ActsAsTenant.with_tenant(instance) do
      Course::Assessment::Submission::AutoGradingService.grade(submission)
      redirect_to(edit_course_assessment_submission_path(submission.assessment.course,
                                                         submission.assessment, submission))
    end
  end
end
