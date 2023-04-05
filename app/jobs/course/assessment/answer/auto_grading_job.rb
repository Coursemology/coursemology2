# frozen_string_literal: true
class Course::Assessment::Answer::AutoGradingJob < ApplicationJob
  include TrackableJob

  # The Answer Auto Grading Job needs to be at a higher priority than submission auto grading jobs,
  # because it is fired off by submission auto grading jobs. If this is at an equal or lower
  # priority than the submission auto grading job, then it is possible that the answer auto grading
  # jobs might never get to run, and then the submission auto grading jobs will never return.
  #
  # Lowering this *will* eventually cause a deadlock.
  #
  # NOTE for is_low_priority flag and :delayed_* queue_as below.
  # For a very specific use case (and as a temporary solution) is_low_priority flag is added to programming question.
  # in order to push grading problem with heavy computation (i.e. 5-10 minutes autograding) to lower priority.
  # This is done to allow all jobs to be run in the main workers,
  # while spinning up other workers that exclude :delayed_* queue
  # to allow other jobs to go through without getting blocked by
  # these delayed_ jobs that would take a very long time to run.
  # Similarly the delayed_ queue is also added for Course::Assessment::Answer::ReducePriorityAutoGradingJob and
  # Course::Assessment::Submission::AutoGradingJob to ensure consistency,
  # and to address job dependencies between submission
  # abd answer autograding.
  queue_as do
    answer = arguments.first
    question = answer.question

    if question.is_low_priority
      :delayed_highest
    else
      :highest
    end
  end

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
      if update_exp?(answer.submission)
        Course::Assessment::Submission::CalculateExpService.update_exp(answer.submission)
      end
    end

    redirect_to redirect_to_path
  end

  private

  def update_exp?(submission)
    submission.assessment.autograded? && !submission.attempting? &&
      !submission.awarded_at.nil? && submission.awarder == User.system
  end
end
