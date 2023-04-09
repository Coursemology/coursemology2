# frozen_string_literal: true
class Course::Assessment::Submission::AutoGradingJob < ApplicationJob
  include TrackableJob
  include Rails.application.routes.url_helpers

  # The Answer Auto Grading Job needs to be at a higher priority than submission auto grading jobs,
  # because it is fired off by submission auto grading jobs. If this is at an equal or lower
  # priority than the submission auto grading job, then it is possible that the answer auto grading
  # jobs might never get to run, and then the submission auto grading jobs will never return.
  #
  # Lowering this *will* eventually cause a deadlock.
  #
  # NOTE: See Course::Assessment::Answer::AutoGradingJob for comments regarding usage of
  # is_low_priority flag and :delayed_* queue_as below.
  queue_as do
    submission = arguments.first
    questions = submission.questions
    any_low_priority_qns = questions.any?(&:is_low_priority?)

    if any_low_priority_qns
      :delayed_default
    else
      :default
    end
  end

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
