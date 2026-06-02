# frozen_string_literal: true
class Course::Assessment::Answer::TextResponseAutoGradingService < \
  Course::Assessment::Answer::AutoGradingService
  def evaluate(answer)
    answer.correct, grade, evaluation_results = evaluate_answer(answer.actable)
    answer.auto_grading.result = {
      messages: explanations_for(evaluation_results),
      evaluation_results: evaluation_results.map do |result|
        result_json = {
          solution_id: result.solution.id,
          grade: result.grade
        }
        result_json[:tests] = result.results if result.results
        result_json
      end
    }
    grade
  end

  private

  SolutionEvaluationResult = Struct.new(:solution, :grade, :explanation, :results)

  # Grades the given answer.
  #
  # @param [Course::Assessment::Answer::TextResponse] answer The answer specified by the
  #   student.
  # @return [Array<(Boolean, Integer, Object)>] The correct status, grade and the messages to be
  #   assigned to the grading.
  def evaluate_answer(answer)
    question = answer.question.actable
    answer_text = answer.normalized_answer_text
    solutions_by_type = question.solutions.group_by(&:solution_type).symbolize_keys

    exact_match_solution = find_correct_exact_match_solution(answer_text, solutions_by_type[:exact_match] || [])
    # Solutions are always kept in an array for easier use of #grade_for and #explanations_for
    evaluation_results =
      if exact_match_solution
        [
          SolutionEvaluationResult.new(
            exact_match_solution,
            exact_match_solution.grade,
            exact_match_solution.explanation
          )
        ]
      else
        evaluate_correct_keyword_solutions(answer_text, solutions_by_type[:keyword] || []) +
          evaluate_correct_regex_solutions(answer_text, solutions_by_type[:regex] || []) +
          evaluate_spreadsheet_formula_solutions(answer_text, solutions_by_type[:spreadsheet_formula] || [])
      end
    [
      correctness_for(question, evaluation_results),
      grade_for(question, evaluation_results),
      evaluation_results
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

  # Returns the regexes that match the given answer text.
  #
  # @param [String] answer_text The answer text entered by the student.
  # @param [Array<Course::Assessment::Question::TextResponse::Solution>] solutions The solutions
  #   to be matched against answer_text.
  # @return [Array<Course::Assessment::Question::TextResponse::Solution>] Solutions that matches
  #   the answer.
  def evaluate_correct_regex_solutions(answer_text, solutions)
    solutions.map do |s|
      match = answer_text.match?(Regexp.new(s.solution, Regexp::IGNORECASE, timeout: 15.0))
      SolutionEvaluationResult.new(s, s.grade, s.explanation) if match
    rescue Regexp::TimeoutError
      SolutionEvaluationResult.new(
        s, 0, I18n.t('errors.course.assessment.text_response_auto_grading.grade.regex_timeout')
      )
    end.compact
  end

  def create_spreadsheet_evaluation_container
    CoursemologyDockerContainer.create(
      'coursemology/evaluator-image-python:3.14',
      argv: ["#{CoursemologyDockerContainer::HOME_PATH}/autograde_spreadsheet.py"],
      entrypoint: ['python3']
    )
  end

  def normalize_formula_text(text)
    formula_text = text.strip
    formula_text.start_with?('=') ? formula_text : "=#{formula_text}"
  end

  def container_test_num_random_tests(solution)
    solution.test_spreadsheet.is_randomization_enabled ? solution.test_spreadsheet.num_random_tests : 0
  end

  def container_test_random_seed(solution)
    solution.test_spreadsheet.is_random_seed_fixed ? solution.test_spreadsheet.test_random_seed : nil
  end

  def container_test_timestamp(solution)
    return unless solution.test_spreadsheet.is_timestamp_fixed

    solution.test_spreadsheet.test_timestamp&.iso8601
  end

  def save_container_test_metadata(container, answer_text, solutions)
    test_data = {
      answer: normalize_formula_text(answer_text),
      solutions: solutions.map do |solution|
        {
          id: solution.id,
          solution: normalize_formula_text(solution.solution),
          variables: solution.test_spreadsheet.variables,
          num_random_tests: container_test_num_random_tests(solution),
          random_seed: container_test_random_seed(solution),
          test_timestamp: container_test_timestamp(solution),
          spreadsheet:
            {
              id: solution.test_spreadsheet.id,
              filename: solution.test_spreadsheet.container_filename
            }
        }
      end
    }.to_json
    container.store_file("#{CoursemologyDockerContainer::HOME_PATH}/tests.json", test_data)
  end

  def save_container_test_spreadsheets(container, solutions)
    solutions.each do |solution|
      next unless solution.test_spreadsheet

      solution.test_spreadsheet.attachment.open(binmode: true) do |file|
        tar = StringIO.new(Docker::Util.create_tar({ solution.test_spreadsheet.container_filename => file.read }))
        container.archive_in_stream(CoursemologyDockerContainer::HOME_PATH) do
          tar.read(Excon.defaults[:chunk_size]).to_s
        end
      end
    end
  end

  def process_spreadsheet_container_evaluation_result(result, solution)
    SolutionEvaluationResult.new(
      solution,
      result['results'].all? { |r| r['correct'] } ? solution.grade : 0,
      if result['results'].any? { |r| r.key?('expectedError') || r.key?('outputError') }
        I18n.t('errors.course.assessment.text_response_auto_grading.grade.evaluation_failed')
      else
        solution.explanation
      end,
      result['results']
    )
  end

  def process_spreadsheet_container_evaluation_results(container, solutions)
    results = JSON.parse(container.read_file("#{CoursemologyDockerContainer::HOME_PATH}/result.json"))
    results['evaluated_solutions'].map do |result|
      solution = solutions.find { |s| s.id == result['solution_id'] }
      process_spreadsheet_container_evaluation_result(result, solution)
    end
  end

  # Returns the spreadsheet formula solutions that matches the given answer text.
  def evaluate_spreadsheet_formula_solutions(answer_text, solutions)
    return [] if solutions.empty?

    container = create_spreadsheet_evaluation_container
    save_container_test_metadata(container, answer_text, solutions)
    save_container_test_spreadsheets(container, solutions)
    container.store_file("#{CoursemologyDockerContainer::HOME_PATH}/autograde_spreadsheet.py",
                         File.read(Rails.root.join('lib', 'evaluator_scripts', 'python', 'autograde_spreadsheet.py')))
    container.execute_package
    process_spreadsheet_container_evaluation_results(container, solutions)
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
