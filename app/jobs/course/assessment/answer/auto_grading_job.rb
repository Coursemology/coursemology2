# frozen_string_literal: true
class Course::Assessment::Answer::AutoGradingJob < ApplicationJob
  include TrackableJob

  protected

  # Performs the auto grading.
  #
  # @param [Course::Assessment::Answer::AutoGrading] auto_grading The object to store the grading
  #   results into.
  def perform_tracked(auto_grading)
    instance = Course.unscoped { auto_grading.answer.question.assessment.course.instance }
    ActsAsTenant.with_tenant(instance) do
      Course::Assessment::Answer::AutoGradingService.grade(auto_grading)
    end
  end
end
