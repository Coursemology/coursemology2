# frozen_string_literal: true
class Course::Assessment::Answer::ProgrammingAutoGradingService < \
  Course::Assessment::Answer::AutoGradingService
  def evaluate(answer)
    answer.correct, grade, programming_auto_grading, = evaluate_answer(answer.actable)
    programming_auto_grading.auto_grading = answer.auto_grading
    grade
  end

  private

  # Grades the given answer.
  #
  # @param [Course::Assessment::Answer::Programming] answer The answer specified by the student.
  # @return [Array<(Boolean, Integer, Course::Assessment::Answer::ProgrammingAutoGrading)>] The
  #   correct status, grade and the programming auto grading record.
  def evaluate_answer(answer)
    question = answer.question.actable
    assessment = answer.submission.assessment
    question.attachment.open(binmode: true) do |temporary_file|
      package = Course::Assessment::ProgrammingPackage.new(temporary_file)
      package.submission_files = build_submission_files(answer)
      package.remove_solution_files
      package.save

      evaluation_result = evaluate_package(question, package)
      build_result(question, evaluation_result,
                   graded_test_case_types: assessment.graded_test_case_types)
    end
  end

  # Builds the hash of files to assign to the package.
  #
  # @param [Course::Assessment::Answer::Programming] answer The answer specified by the student.
  # @return [Hash{String => String}] The files in the answer, with the file names as keys, and
  #   the file content as values.
  def build_submission_files(answer)
    answer.files.map do |file|
      [file.filename, file.content]
    end.to_h
  end

  # Evaluates the package to obtain the set of tests.
  #
  # @param [Course::Assessment::ProgrammingPackage] package The package to import.
  # @return [Course::Assessment::ProgrammingEvaluationService::Result]
  def evaluate_package(question, package)
    Course::Assessment::ProgrammingEvaluationService.
      execute(question.language, question.memory_limit, question.time_limit, package.path)
  end

  # Builds the result of the auto grading from the evaluation result.
  #
  # @param [Course::Assessment::Question::Programming] question The programming question being
  #   graded.
  # @param [Course::Assessment::ProgrammingEvaluationService::Result] evaluation_result The
  #   result of evaluating the package.
  # @param [Array<String>] graded_test_case_types The types of test cases counted
  #   towards grade/exp calculation
  # @return [Array<(Boolean, Integer, Course::Assessment::Answer::ProgrammingAutoGrading), Integer>]
  #   The correctness apparent to student ('True' if answer passes public and private test
  #   cases), grade, the programming auto grading record, and the evaluation result's id.
  def build_result(question, evaluation_result, graded_test_case_types:)
    auto_grading = build_auto_grading(question, evaluation_result)
    graded_test_count = question.test_cases.where(test_case_type: graded_test_case_types).size
    passed_test_count = count_passed_test_cases(auto_grading, graded_test_case_types)

    considered_correct = check_correctness(question, auto_grading)
    grade = if graded_test_count == 0
              question.maximum_grade
            else
              question.maximum_grade * passed_test_count / graded_test_count
            end
    [considered_correct, grade, auto_grading, evaluation_result.evaluation_id]
  end

  # Builds a ProgrammingAutoGrading instance from the question and package evaluation result.
  #
  # @param [Course::Assessment::Question::Programming] question The programming question being
  #   graded.
  # @param [Course::Assessment::ProgrammingEvaluationService::Result] evaluation_result The
  #   result of evaluating the package.
  # @return [Course::Assessment::Answer::ProgrammingAutoGrading] auto_grading The
  #   ProgrammingAutoGrading instance
  def build_auto_grading(question, evaluation_result)
    auto_grading = Course::Assessment::Answer::ProgrammingAutoGrading.new(actable: nil)
    set_auto_grading_results(auto_grading, evaluation_result)
    build_test_case_records(question, auto_grading, evaluation_result.test_reports)
    auto_grading
  end

  # Checks if the answer passes all public and private test cases.
  #
  # @param [Course::Assessment::Question::Programming] question The programming question being
  #   graded.
  # @param [Course::Assessment::Answer::ProgrammingAutoGrading] auto_grading The
  #   ProgrammingAutoGrading instance
  # @return [Boolean] True if the evaluated answer passes all public and private test cases
  def check_correctness(question, auto_grading)
    check_test_types = ['public_test', 'private_test'].freeze
    test_count = question.test_cases.reject(&:evaluation_test?).size
    passed_test_count = count_passed_test_cases(auto_grading, check_test_types)
    passed_test_count == test_count
  end

  def count_passed_test_cases(auto_grading, test_case_types)
    auto_grading.test_results.
      select { |r| test_case_types.include?(r.test_case.test_case_type) && r.passed? }.count
  end

  # Checks presence of test report and builds the test case records.
  #
  # @param [Course::Assessment::Question::Programming] question The programming question being
  #   graded.
  # @param [Course::Assessment::Answer::ProgrammingAutoGrading] auto_grading The programming auto
  #   grading result to store the test results in.
  # @param [String] test_report The test case report from evaluating the package.
  # @return [Array<Course::Assessment::Question::ProgrammingTestCase>] Only the test cases not in
  #   any reports.
  def build_test_case_records(question, auto_grading, test_reports)
    test_reports.values.each do |test_report|
      build_test_case_records_from_report(question, auto_grading, test_report) if test_report.present?
    end

    # Build failed test case records for test cases which were not found in any reports.
    build_failed_test_case_records(question, auto_grading)
  end

  # Builds test case records from test report.
  #
  # @param [Course::Assessment::Question::Programming] question The programming question being
  #   graded.
  # @param [Course::Assessment::Answer::ProgrammingAutoGrading] auto_grading The programming auto
  #   grading result to store the test results in.
  # @param [String] test_report The test case report from evaluating the package.
  # @return [Array<Course::Assessment::Question::ProgrammingTestCase>]
  def build_test_case_records_from_report(question, auto_grading, test_report)
    test_cases = question.test_cases.map { |test_case| [test_case.identifier, test_case] }.to_h
    test_results = parse_test_report(question.language, test_report)

    test_results.map do |test_result|
      test_case = find_test_case(test_cases, test_result)
      auto_grading.test_results.build(auto_grading: auto_grading, test_case: test_case,
                                      passed: test_result.passed?,
                                      messages: test_result.messages)
    end
  end

  # Builds test case records for remaining test cases when there is no test report.
  # Treats all remaining test cases without a test result yet as failed.
  #
  # @param [Course::Assessment::Question::Programming] question The programming question being
  #   graded.
  # @param [Course::Assessment::Answer::ProgrammingAutoGrading] auto_grading The programming auto
  #   grading result to store the test results in.
  # @return [Array<Course::Assessment::Question::ProgrammingTestCase>]
  def build_failed_test_case_records(question, auto_grading)
    messages = {
      'error': I18n.t('course.assessment.answer.programming_auto_grading.grade.evaluation_failed')
    }
    remaining_test_cases = question.test_cases - auto_grading.test_results.map(&:test_case)
    remaining_test_cases.map do |test_case|
      auto_grading.test_results.build(
        auto_grading: auto_grading, test_case: test_case,
        passed: false,
        messages: messages
      )
    end
  end

  # Sets results which belong to the auto grading rather than an individual test case.
  #
  # @param [Course::Assessment::Answer::ProgrammingAutoGrading] auto_grading The programming auto
  #   grading result to store the test results in.
  # @param [Course::Assessment::ProgrammingEvaluationService::Result] evaluation_result The
  #   result of evaluating the package.
  # @return [Course::Assessment::Answer::ProgrammingAutoGrading]
  def set_auto_grading_results(auto_grading, evaluation_result)
    auto_grading.tap do |ag|
      ag.stdout = evaluation_result.stdout
      ag.stderr = evaluation_result.stderr
      ag.exit_code = evaluation_result.exit_code
    end
  end

  # Finds the appropriate test case given the identifier of the test case.
  #
  # @param [Hash{String=>Course::Assessment::Question::ProgrammingTestCase}] test_cases The test
  #   cases in the question, keyed by identifier.
  # @param [Course::Assessment::ProgrammingTestCaseReport::TestCase] test_result The test case to
  #   look up.
  # @return [Course::Assessment::Question::ProgrammingTestCase] The programming test case that
  #   has the given identifier.
  def find_test_case(test_cases, test_result)
    test_cases[test_result.identifier]
  end

  # Parses the test report for test cases and statuses.
  #
  # @param [Coursemology::Polyglot::Language] lanugage The language of which the
  #   test_report will be parsed based on
  # @param [String] test_report The test case report from evaluating the package.
  # @return [Array<>]
  def parse_test_report(language, test_report)
    if language.is_a?(Coursemology::Polyglot::Language::Java)
      Course::Assessment::Java::JavaProgrammingTestCaseReport.new(test_report).test_cases
    else
      Course::Assessment::ProgrammingTestCaseReport.new(test_report).test_cases
    end
  end
end
