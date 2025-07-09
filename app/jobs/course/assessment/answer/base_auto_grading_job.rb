# frozen_string_literal: true
class Course::Assessment::Answer::BaseAutoGradingJob < ApplicationJob
  include TrackableJob

  DEFAULT_TIMEOUT = Course::Assessment::ProgrammingEvaluationService::DEFAULT_TIMEOUT

  class PriorityShouldBeLoweredError < StandardError
    def initialize(message = nil)
      super(message || 'Priority for this job needs to be lowered')
    end
  end

  retry_on PriorityShouldBeLoweredError, queue: -> { delayed_queue_name }

  queue_as do
    answer = arguments.first
    question = answer.question

    question.is_low_priority ? delayed_queue_name : default_queue_name
  end

  protected

  def default_queue_name
    raise NotImplementedError, 'Subclasses must implmement default_queue_name method.'
  end

  def delayed_queue_name
    raise NotImplementedError, 'Subclasses must implmement delayed_queue_name method.'
  end

  # Performs the auto grading.
  #
  # @param [String|nil] redirect_to_path The path to be redirected after auto grading job was
  #   finished.
  # @param [Course::Assessment::Answer] answer the answer to be graded.
  # @param [Course::Assessment::AutoGrading] The auto grading result to save the results to.
  # @param [String] redirect_to_path The path to redirect when job finishes.
  def perform_tracked(answer, auto_grading, redirect_to_path = nil)
    ActsAsTenant.without_tenant do
      raise PriorityShouldBeLoweredError if !queue_name.include?('delayed') && answer.question.is_low_priority

      downgrade_if_timeout(answer.question) do
        Course::Assessment::Answer::AutoGradingService.grade(answer, auto_grading)
      end

      if update_exp?(answer.submission)
        Course::Assessment::Submission::CalculateExpService.update_exp(answer.submission)
      end
    end

    redirect_to redirect_to_path
  end

  def update_exp?(submission)
    submission.assessment.autograded? && !submission.attempting? &&
      !submission.awarded_at.nil? && submission.awarder == User.system
  end

  def downgrade_if_timeout(question, &block)
    start_time = Time.now
    block.call
    end_time = Time.now
    return unless !question.is_low_priority? && end_time - start_time > DEFAULT_TIMEOUT

    question.update_attribute(:is_low_priority, true)
  end
end
