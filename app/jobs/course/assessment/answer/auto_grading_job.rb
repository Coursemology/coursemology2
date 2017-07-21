# frozen_string_literal: true
class Course::Assessment::Answer::AutoGradingJob < ApplicationJob
  include TrackableJob

  # The Answer Auto Grading Job needs to be at a higher priority than submission auto grading jobs,
  # because it is fired off by submission auto grading jobs. If this is at an equal or lower
  # priority than the submission auto grading job, then it is possible that the answer auto grading
  # jobs might never get to run, and then the submission auto grading jobs will never return.
  #
  # Lowering this *will* eventually cause a deadlock.
  queue_as :highest

  protected

  # Performs the auto grading.
  #
  # @param [String|nil] redirect_to_path The path to be redirected after auto grading job was
  #   finished.
  # @param [Course::Assessment::Answer] answer the answer to be graded.
  # @param [String] redirect_to_path The path to redirect when job finishes.
  def perform_tracked(answer, redirect_to_path = nil)
    ActsAsTenant.without_tenant do
      Course::Assessment::Answer::AutoGradingService.grade(answer)
    end

    redirect_to redirect_to_path
  end
end
