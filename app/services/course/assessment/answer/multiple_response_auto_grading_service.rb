# frozen_string_literal: true
class Course::Assessment::Answer::MultipleResponseAutoGradingService < \
  Course::Assessment::Answer::AutoGradingService
  def evaluate(answer)
    answer.correct, grade, messages = evaluate_answer(answer.actable)
    answer.auto_grading.result = { messages: messages }
    grade
  end

  private

  # Grades the given answer.
  #
  # @param [Course::Assessment::Answer::MultipleResponse] answer The answer specified by the
  #   student.
  # @return [Array<(Boolean, Integer, Object)>] The correct status, grade and the messages to be
  #   assigned to the grading.
  def evaluate_answer(answer)
    question = answer.question.actable

    if question.any_correct?
      grade_any_correct(question, answer)
    else
      grade_all_correct(question, answer)
    end
  end

  # Grades an any_correct question.
  #
  # @param [Course::Assessment::Question::MultipleResponse] question The question being attempted.
  # @param [Course::Assessment::Answer::MultipleResponse] answer The answer from the user.
  def grade_any_correct(question, answer)
    correct_selection = question.options.correct & answer.options.uniq
    correct = !correct_selection.empty? && (correct_selection.length == answer.options.length)

    [correct, grade_for(question, correct), explanations_for(answer.options)]
  end

  # Grades an all_correct question.
  #
  # @param [Course::Assessment::Question::MultipleResponse] question The question being attempted.
  # @param [Course::Assessment::Answer::MultipleResponse] answer The answer from the user.
  def grade_all_correct(question, answer)
    correct_answers = question.options.correct
    correct_selection = correct_answers & answer.options.uniq
    wrong_selection = (answer.options.uniq | correct_answers) - correct_selection
    correct = wrong_selection.empty?

    [correct, grade_for(question, correct), explanations_for(wrong_selection[0, 1])]
  end

  # Returns the grade for the given correctness.
  #
  # @param [Course::Assessment::Question::MultipleResponse] question The question answered by the
  #   student.
  # @param [Boolean] correct True if the answer is correct.
  def grade_for(question, correct)
    correct ? question.maximum_grade : 0
  end

  # Returns the explanations for the given options.
  #
  # @param [Course::Assessment::Question::MultipleResponseOption] answers The options to obtain
  #   the explanations for.
  # @return [Array<String>] The explanations for the given answers.
  def explanations_for(answers)
    answers.map(&:explanation).tap(&:compact!)
  end
end
