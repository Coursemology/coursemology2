# frozen_string_literal: true
class Course::Assessment::Answer::ProgrammingCodaveriAutoGradingService <
  Course::Assessment::Answer::AutoGradingService
  def evaluate(answer, auto_grading)
    unless answer.submission.assessment.course.component_enabled?(Course::CodaveriComponent)
      raise CodaveriError, I18n.t('course.assessment.question.programming.question_type_codaveri_deactivated')
    end

    answer.correct, grade, programming_auto_grading, = evaluate_answer(answer.actable)
    programming_auto_grading.auto_grading = auto_grading
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
    question.max_time_limit = answer.submission.assessment.course.programming_max_time_limit
    assessment = answer.submission.assessment
    evaluation_result = evaluate_package(assessment.course, question, answer)
    test_cases = evaluated_test_cases(question, evaluation_result.evaluation_results)
    build_result(question, test_cases, evaluation_result,
                 graded_test_case_types: assessment.graded_test_case_types)
  end

  # The test cases of the version of the question that Codaveri evaluated.
  #
  # The Codaveri problem is replaced whenever the question is re-imported, which can happen while this evaluation
  # runs, so it may hold a different version from the one this run started on. Nothing local can be pinned to it.
  # Instead, each result names the test case it is for (its index is the test case's id, as pushed to Codaveri),
  # and a re-import moves the replaced version's test cases to a snapshot rather than deleting them. So the
  # results identify the version they were graded against.
  #
  # Without results to go by, the live question's test cases are used.
  #
  # @param [Course::Assessment::Question::Programming] question The question being graded.
  # @param [Array<Course::Assessment::ProgrammingCodaveriEvaluationService::TestCaseResult>] evaluation_results
  # @return [Array<Course::Assessment::Question::ProgrammingTestCase>]
  # @raise [CodaveriError] When the results are not all for test cases of one version of this question.
  def evaluated_test_cases(question, evaluation_results)
    test_case_ids = evaluation_results.map(&:index).uniq
    programming_test_case = Course::Assessment::Question::ProgrammingTestCase
    return programming_test_case.where(question_id: question.id).to_a if test_case_ids.empty?

    version_ids = programming_test_case.where(id: test_case_ids).pluck(:id, :question_id).to_h
    version_id = version_ids.values.uniq.sole if version_ids.size == test_case_ids.size && version_ids.values.uniq.one?
    unless version_id && version_of?(question, version_id)
      raise CodaveriError, 'Codaveri evaluated test cases that are not all of one version of this question.'
    end

    programming_test_case.where(question_id: version_id).to_a
  end

  # @return [Boolean] Whether the given id is the question's, or one of its snapshots'.
  def version_of?(question, version_id)
    version_id == question.id ||
      Course::Assessment::Question::Programming.where(id: version_id).pick(:current_id) == question.id
  end

  # Evaluates the package to obtain the set of tests.
  #
  # @param [Course] course The course.
  # @param [Course::Assessment::Question::Programming] question The programming question being
  #   graded.
  # @param [Course::Assessment::Answer::Programming] answer The answer specified by the student.
  # @return [Course::Assessment::ProgrammingCodaveriEvaluationService::Result]
  def evaluate_package(course, question, answer)
    Course::Assessment::ProgrammingCodaveriEvaluationService.execute(course, question, answer)
  end

  # Builds the result of the auto grading from the codevari evaluation result.
  #
  # @param [Course::Assessment::Question::Programming] question The programming question being
  #   graded.
  # @param [Array<Course::Assessment::Question::ProgrammingTestCase>] test_cases The test cases of the version
  #   Codaveri evaluated.
  # @param [Course::Assessment::ProgrammingCodaveriEvaluationService::Result] evaluation_result The
  #   result of evaluating the package.
  # @param [Array<String>] graded_test_case_types The types of test cases counted
  #   towards grade/exp calculation
  # @return [Array<(Boolean, Integer, Course::Assessment::Answer::ProgrammingAutoGrading), Integer>]
  #   The correctness apparent to student ('True' if answer passes public and private test
  #   cases), grade, the programming auto grading record, and the evaluation result's id.
  def build_result(question, test_cases, evaluation_result, graded_test_case_types:)
    auto_grading = build_auto_grading(test_cases, evaluation_result)
    graded_test_count = test_cases.count do |test_case|
      graded_test_case_types.include?(test_case.test_case_type)
    end
    passed_test_count = count_passed_test_cases(auto_grading, graded_test_case_types)

    considered_correct = correct?(test_cases, auto_grading)
    grade = if graded_test_count == 0
              question.maximum_grade
            else
              question.maximum_grade * passed_test_count / graded_test_count
            end
    [considered_correct, grade, auto_grading, evaluation_result.evaluation_id]
  end

  # Builds a ProgrammingAutoGrading instance from the test cases and codaveri evaluation result.
  #
  # @param [Array<Course::Assessment::Question::ProgrammingTestCase>] test_cases The test cases of the version
  #   Codaveri evaluated.
  # @param [Course::Assessment::ProgrammingCodaveriEvaluationService::Result] evaluation_result The
  #   result of evaluating the code from Codaveri.
  # @return [Course::Assessment::Answer::ProgrammingAutoGrading] auto_grading The
  #   ProgrammingAutoGrading instance
  def build_auto_grading(test_cases, evaluation_result)
    auto_grading = Course::Assessment::Answer::ProgrammingAutoGrading.new(actable: nil)
    set_auto_grading_results(auto_grading, evaluation_result)
    build_test_case_records(test_cases, auto_grading, evaluation_result.evaluation_results)
    auto_grading
  end

  # Checks if the answer passes all public and private test cases.
  #
  # @param [Array<Course::Assessment::Question::ProgrammingTestCase>] test_cases The test cases of the version
  #   Codaveri evaluated.
  # @param [Course::Assessment::Answer::ProgrammingAutoGrading] auto_grading The
  #   ProgrammingAutoGrading instance
  # @return [Boolean] True if the evaluated answer passes all public and private test cases
  def correct?(test_cases, auto_grading)
    check_test_types = ['public_test', 'private_test'].freeze
    test_count = test_cases.reject(&:evaluation_test?).size
    passed_test_count = count_passed_test_cases(auto_grading, check_test_types)
    passed_test_count == test_count
  end

  def count_passed_test_cases(auto_grading, test_case_types)
    auto_grading.test_results.
      select { |r| test_case_types.include?(r.test_case.test_case_type) && r.passed? }.count
  end

  # Checks presence of codaveri evaluation test results and builds the test case records.
  #
  # @param [Array<Course::Assessment::Question::ProgrammingTestCase>] test_cases The test cases of the version
  #   Codaveri evaluated.
  # @param [Course::Assessment::Answer::ProgrammingAutoGrading] auto_grading The programming auto
  #   grading result to store the test results in.
  # @param [String] evaluation_results The evaluation results from Codaveri API Response.
  # @return [Array<Course::Assessment::Question::ProgrammingTestCase>] Only the test cases not in
  #   any codaveri evaluation result.
  def build_test_case_records(test_cases, auto_grading, evaluation_results)
    build_test_case_records_from_test_results(test_cases, auto_grading, evaluation_results)

    # Build failed test case records for test cases which were not found in any evaluation result.
    build_failed_test_case_records(test_cases, auto_grading)
  end

  # Builds test case records from codaveri evaluation test results.
  #
  # @param [Array<Course::Assessment::Question::ProgrammingTestCase>] test_cases The test cases of the version
  #   Codaveri evaluated.
  # @param [Course::Assessment::Answer::ProgrammingAutoGrading] auto_grading The programming auto
  #   grading result to store the test results in.
  # @param [Array<Struct>] evaluation_results The evaluation results from Codaveri API Response.
  # @return [Array<Course::Assessment::Question::ProgrammingTestCase>]
  def build_test_case_records_from_test_results(test_cases, auto_grading, evaluation_results)
    test_cases = test_cases.index_by(&:id)
    evaluation_results.map do |result|
      test_case = find_test_case(test_cases, result.index)
      messages ||= {
        error: result.error,
        hint: test_case.hint,
        # By default, output (if any) will take precedence over error in "Output" test case display.
        # This prevents that by suppressing the output in case of error.
        output: result.error.blank? ? result.output : '',
        code: result.exit_code,
        signal: result.exit_signal
      }.reject! { |_, v| v.blank? }

      auto_grading.test_results.build(auto_grading: auto_grading, test_case: test_case,
                                      passed: result.success,
                                      messages: messages)
    end
  end

  # Builds test case records for remaining test cases when there is no evaluation test result.
  # Treats all remaining test cases without a test result yet as failed.
  #
  # @param [Array<Course::Assessment::Question::ProgrammingTestCase>] test_cases The test cases of the version
  #   Codaveri evaluated.
  # @param [Course::Assessment::Answer::ProgrammingAutoGrading] auto_grading The programming auto
  #   grading result to store the test results in.
  # @return [Array<Course::Assessment::Question::ProgrammingTestCase>]
  def build_failed_test_case_records(test_cases, auto_grading)
    messages = {
      error: I18n.t('errors.course.assessment.answer.programming_auto_grading.grade.evaluation_failed_syntax')
    }
    remaining_test_cases = test_cases - auto_grading.test_results.map(&:test_case)
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
  #   result of evaluating the package from Codaveri.
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
  # @param Integer id The test case to look up.
  # @return [Course::Assessment::Question::ProgrammingTestCase] The programming test case that
  #   has the given identifier.
  def find_test_case(test_cases, id)
    test_cases[id]
  end
end
