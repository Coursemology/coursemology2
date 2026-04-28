# frozen_string_literal: true
class Course::Assessment::Answer::TextResponseAutoGradingService < \
  Course::Assessment::Answer::AutoGradingService
  def evaluate(answer)
    answer.correct, grade, messages = evaluate_answer(answer.actable)
    answer.auto_grading.result = { messages: messages }
    grade
  end

  private

  SolutionEvaluationResult = Struct.new(:solution, :grade, :explanation)

  # Grades the given answer.
  #
  # @param [Course::Assessment::Answer::TextResponse] answer The answer specified by the
  #   student.
  # @return [Array<(Boolean, Integer, Object)>] The correct status, grade and the messages to be
  #   assigned to the grading.
  def evaluate_answer(answer)
    question = answer.question.actable
    answer_text = answer.normalized_answer_text
    exact_matches = question.solutions.select(&:exact_match?)
    keywords = question.solutions.select(&:keyword?)
    spreadsheet_formulas = question.solutions.select(&:spreadsheet_formula?)

    exact_match_solution = find_correct_exact_match_solution(answer_text, exact_matches)
    # Solutions are always kept in an array for easier use of #grade_for and #explanations_for
    evaluation_results = if exact_match_solution
                           [
                             SolutionEvaluationResult.new(
                               exact_match_solution,
                               exact_match_solution.grade,
                               exact_match_solution.explanation
                             )
                           ]
                         else
                           evaluate_correct_keyword_solutions(answer_text, keywords) +
                           evaluate_spreadsheet_formula_solutions(answer_text, spreadsheet_formulas)
                         end
    [
      correctness_for(question, evaluation_results),
      grade_for(question, evaluation_results),
      explanations_for(evaluation_results)
    ]
  end

  # Returns one solution that exactly matches the answer.
  #
  # @param [String] answer_text The answer text entered by the student.
  # @param [Array<Course::Assessment::Question::TextResponse::Solution>] solutions The solutions
  #   to be matched against answer_text.
  # @return [Course::Assessment::Question::TextResponse::Solution] Solution that exactly matches
  #   the answer.
  def find_correct_exact_match_solution(answer_text, solutions)
    # comparison is case insensitive
    solutions.find { |s| s.solution.encode(universal_newline: true).casecmp(answer_text) == 0 }
  end

  # Returns the keywords found in the given answer text.
  #
  # @param [String] answer_text The answer text entered by the student.
  # @param [Array<Course::Assessment::Question::TextResponse::Solution>] solutions The solutions
  #   to be matched against answer_text.
  # @return [Array<Course::Assessment::Question::TextResponse::Solution>] Solutions that matches
  #   the answer.
  def evaluate_correct_keyword_solutions(answer_text, solutions)
    # TODO(minqi): Add tokenizer and stemmer for more natural keyword matching.
    solutions.select { |s| answer_text.downcase.include?(s.solution.downcase) }.
      map { |s| SolutionEvaluationResult.new(s, s.grade, s.explanation) }
  end

  def normalize_formula_text(text)
    formula_text = text.strip
    formula_text.start_with?('=') ? formula_text : "=#{formula_text}"
  end

  # Returns the spreadsheet formula solutions that matches the given answer text.
  def evaluate_spreadsheet_formula_solutions(answer_text, solutions)
    container = CoursemologyDockerContainer.create(
      'coursemology/evaluator-image-python:3.14',
      argv: ["#{CoursemologyDockerContainer::HOME_PATH}/autograde_spreadsheet.py"],
      entrypoint: ['python3']
    )
    container.store_file("#{CoursemologyDockerContainer::HOME_PATH}/tests.json", {
      answer: normalize_formula_text(answer_text),
      solutions: solutions.map do |solution|
        {
          id: solution.id,
          solution: normalize_formula_text(solution.solution),
          spreadsheets: solution.test_spreadsheets.map do |sheet|
            sheet.attachment.open(binmode: true) do |file|
              tar = StringIO.new(Docker::Util.create_tar({ sheet.container_filename => file.read }))
              container.archive_in_stream(CoursemologyDockerContainer::HOME_PATH) do
                tar.read(Excon.defaults[:chunk_size]).to_s
              end
            end
            {
              id: sheet.id,
              filename: sheet.container_filename
            }
          end
        }
      end,
      variables: {}
    }.to_json)
    container.store_file("#{CoursemologyDockerContainer::HOME_PATH}/autograde_spreadsheet.py", File.read(File.join(__dir__, 'autograde_spreadsheet.py')))
    container.execute_package
    results = JSON.parse(container.read_file("#{CoursemologyDockerContainer::HOME_PATH}/result.json"))
    results['results'].map do |result|
      solution = solutions.find { |s| s.id == result['solution_id'] }
      SolutionEvaluationResult.new(
        solution,
        solution.grade * result['spreadsheets'].count { |s| s['correct'] },
        solution.explanation
      )
    end
  ensure
    container&.delete
  end

  # Returns the grade for a question with all matched solutions.
  #
  # The grade is considered to be the sum of grades assigned to all matched solutions, but not
  # exceeding the maximum grade of the question.
  #
  # @param [Course::Assessment::Question::TextResponse] question The question answered by the
  #   student.
  # @param [Array<SolutionEvaluationResult>] evaluation_results The evaluation results for the student's answer.
  # @return [Integer] The grade for the question.
  def grade_for(question, evaluation_results)
    [evaluation_results.map(&:grade).reduce(0, :+), question.maximum_grade].min
  end

  # Returns the explanations for the given options.
  #
  # @param [Array<SolutionEvaluationResult>] evaluation_results The evaluation results for the student's answer.
  # @return [Array<String>] The explanations for the given solutions.
  def explanations_for(evaluation_results)
    evaluation_results.map(&:explanation).tap(&:compact!)
  end

  # Mark the correctness of the answer based on solutions.
  #
  # @param [Course::Assessment::Question::TextResponse] question The question answered by the
  #   student.
  # @param [Array<SolutionEvaluationResult>] evaluation_results The evaluation results for the student's answer.
  # @return [Boolean] correct True if the answer is correct.
  def correctness_for(question, evaluation_results)
    grade_for(question, evaluation_results) >= question.maximum_grade
  end
end
