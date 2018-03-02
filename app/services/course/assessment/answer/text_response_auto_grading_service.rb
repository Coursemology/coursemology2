# frozen_string_literal: true
class Course::Assessment::Answer::TextResponseAutoGradingService < \
  Course::Assessment::Answer::AutoGradingService
  def evaluate(answer)
    answer.correct, grade, messages = evaluate_answer(answer.actable)
    answer.auto_grading.result = { messages: messages }
    grade
  end

  private

  # Grades the given answer.
  #
  # @param [Course::Assessment::Answer::TextResponse] answer The answer specified by the
  #   student.
  # @return [Array<(Boolean, Integer, Object)>] The correct status, grade and the messages to be
  #   assigned to the grading.
  def evaluate_answer(answer)
    question = answer.question.actable
    answer_text = answer.normalized_answer_text
    exact_matches, keywords = question.solutions.partition(&:exact_match?)

    solutions = find_exact_match(answer_text, exact_matches)
    # If there is no exact match, we fall back to keyword matches.
    # Solutions are always kept in an array for easier use of #grade_for and #explanations_for
    solutions = solutions.present? ? [solutions] : find_keywords(answer_text, keywords)

    [
      correctness_for(question, solutions),
      grade_for(question, solutions),
      explanations_for(solutions)
    ]
  end

  # Returns one solution that exactly matches the answer.
  #
  # @param [String] answer_text The answer text entered by the student.
  # @param [Array<Course::Assessment::Question::TextResponseSolution>] solutions The solutions
  #   to be matched against answer_text.
  # @return [Course::Assessment::Question::TextResponseSolution] Solution that exactly matches
  #   the answer.
  def find_exact_match(answer_text, solutions)
    # comparison is case insensitive
    solutions.find { |s| s.solution.encode(universal_newline: true).casecmp(answer_text) == 0 }
  end

  # Returns the keywords found in the given answer text.
  #
  # @param [String] answer_text The answer text entered by the student.
  # @param [Array<Course::Assessment::Question::TextResponseSolution>] solutions The solutions
  #   to be matched against answer_text.
  # @return [Array<Course::Assessment::Question::TextResponseSolution>] Solutions that matches
  #   the answer.
  def find_keywords(answer_text, solutions)
    # TODO(minqi): Add tokenizer and stemmer for more natural keyword matching.
    solutions.select { |s| answer_text.downcase.include?(s.solution.downcase) }
  end

  # Returns the grade for a question with all matched solutions.
  #
  # The grade is considered to be the sum of grades assigned to all matched solutions, but not
  # exceeding the maximum grade of the question.
  #
  # @param [Course::Assessment::Question::TextResponse] question The question answered by the
  #   student.
  # @param [Array<Course::Assessment::Question::TextResponseSolution>] solutions The solutions that
  #   matches the student's answer.
  # @return [Integer] The grade for the question.
  def grade_for(question, solutions)
    [solutions.map(&:grade).reduce(0, :+), question.maximum_grade].min
  end

  # Returns the explanations for the given options.
  #
  # @param [Array<Course::Assessment::Question::TextResponseSolution>] solutions The solutions to
  #   obtain the explanations for.
  # @return [Array<String>] The explanations for the given solutions.
  def explanations_for(solutions)
    solutions.map(&:explanation).tap(&:compact!)
  end

  # Mark the correctness of the answer based on solutions.
  #
  # @param [Course::Assessment::Question::TextResponse] question The question answered by the
  #   student.
  # @param [Array<Course::Assessment::Question::TextResponseSolution>] solutions The solutions that
  #   matches the student's answer.
  # @return [Boolean] correct True if the answer is correct.
  def correctness_for(question, solutions)
    solutions.map(&:grade).sum >= question.maximum_grade
  end
end
