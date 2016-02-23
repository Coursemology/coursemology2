# frozen_string_literal: true
module Course::Assessment::Submission::SubmissionsHelper
  # The maximum step that current user can attempt.
  def max_step
    @max_step ||= @assessment.questions.
                  index(@assessment.questions.next_unanswered(@submission)) + 1
  end

  # The step that current user is on.
  def current_step
    @current_step ||= begin
      current_question = @questions_to_attempt.first
      @assessment.questions.index(current_question) + 1
    end
  end

  # Highlight current step and grey out un-accessible steps.
  def nav_class(step)
    return 'active' if step == current_step
    return 'disabled' if step > max_step

    ''
  end
end
