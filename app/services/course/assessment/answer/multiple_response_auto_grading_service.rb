class Course::Assessment::Answer::MultipleResponseAutoGradingService < \
  Course::Assessment::Answer::AutoGradingService
  def grade(auto_grading)
    auto_grading.answer.grade, messages = grade_answer(auto_grading.answer.actable)
    auto_grading.result = { messages: messages }
    super(auto_grading)
  end

  private

  # Grades the given answer.
  #
  # @param [Course::Assessment::Answer::MultipleResponse] answer The answer specified by the
  #   student.
  # @return [Array<(Fixnum, Object)>] The grade and the messages to be assigned to the grading.
  def grade_answer(answer)
    if answer.question.actable.any_correct?
      grade_any_correct(answer)
    else
      grade_all_correct(answer)
    end
  end

  def grade_any_correct(answer)
    fail NotImplementedError
  end

  def grade_all_correct(answer)
    question = answer.question.actable
    correct_options = question.options.correct
    correct = (correct_options & answer.options).length == correct_options.length

    grade_for(question, correct)
  end

  # Returns the grade for the given correctness.
  #
  # @param [Course::Assessment::Question::MultipleResponse] question The question answered by the
  #   student.
  # @param [Boolean] correct True if the answer is correct.
  def grade_for(question, correct)
    correct ? question.maximum_grade : 0
  end
end
