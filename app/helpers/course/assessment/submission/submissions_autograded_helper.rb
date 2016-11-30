# frozen_string_literal: true
module Course::Assessment::Submission::SubmissionsGuidedHelper
  # The maximum step that current user can attempt.
  def guided_max_step
    @guided_max_step ||= begin
      question = guided_next_unanswered_question
      if question && cannot?(:manage, @assessment)
        @assessment.questions.index(question) + 1
      else
        # All questions have been answered or user is a staff.
        @assessment.questions.length
      end
    end
  end

  def guided_next_unanswered_question
    @guided_next_unanswered_question ||= @assessment.questions.next_unanswered(@submission)
  end

  # The step that current user is on.
  def guided_current_step
    @guided_current_step ||= begin
      @assessment.questions.index(@current_question) + 1
    end
  end

  # Highlight current step and grey out un-accessible steps.
  def guided_nav_class(step)
    return 'active' if step == guided_current_step
    return 'disabled' if step > guided_max_step
    return 'completed' if step <= guided_max_step
  end

  def guided_current_answer
    @answers.last
  end
end
