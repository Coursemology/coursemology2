# frozen_string_literal: true
class Course::Assessment::Answer::AutoGradingJob < ApplicationJob
  include TrackableJob

  protected

  # Performs the auto grading.
  #
  # @param [String|nil] redirect_to_path The path to be redirected after auto grading job was
  #   finished.
  # @param [Course::Assessment::Answer] answer the answer to be graded.
  # @param [String] redirect_to_path The path to redirect when job finishes.
  # @param [Boolean] reattempt Whether to create new answer based on current answer after grading.
  def perform_tracked(answer, redirect_to_path = nil, reattempt = false)
    instance = Course.unscoped { answer.course.instance }
    ActsAsTenant.with_tenant(instance) do
      Course::Assessment::Answer::AutoGradingService.grade(answer, reattempt)
    end

    redirect_to redirect_to_path
  end
end
