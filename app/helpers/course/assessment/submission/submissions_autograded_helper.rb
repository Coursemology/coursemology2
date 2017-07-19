# frozen_string_literal: true
module Course::Assessment::Submission::SubmissionsAutogradedHelper
  # The maximum step that current user can attempt.
  def max_step
    @max_step ||= begin
      question = next_unanswered_question
      if question && !@assessment.skippable && cannot?(:manage, @assessment)
        @assessment.questions.index(question) + 1
      else
        # All questions have been answered or assessment is skippable or user is a staff.
        @assessment.questions.length
      end
    end
  end

  def next_unanswered_question
    @next_unanswered_question ||= @assessment.questions.next_unanswered(@submission)
  end

  # The step that current user is on.
  def current_step
    @current_step ||= begin
      @current_question ? @assessment.questions.index(@current_question) + 1 : nil
    end
  end

  # Highlight current step and grey out un-accessible steps.
  def nav_class(step)
    return 'active' if step == current_step
    return 'disabled' if step > max_step
    return 'completed' if step <= max_step
  end

  # Get current_answer from the submission question.
  def current_answer
    @current_submission_question.current_answer
  end
end
