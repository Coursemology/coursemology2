# frozen_string_literal: true
# Imports the provided programming package into the question. This evaluates the package to
# obtain the set of tests, as well as extracts the templates from the package to be stored
# together with the question.
class Course::Assessment::Question::ProgrammingImportService
  class << self
    # Imports the programming package into the question.
    #
    # @param [Course::Assessment::Question::Programming] question The programming question for
    #   import.
    # @param [Attachment] attachment The attachment containing the package to import.
    def import(question, attachment)
      new(question, attachment).send(:import)
    end
  end

  private

  # Creates a new service import object.
  #
  # @param [Course::Assessment::Question::Programming] question The programming question for import.
  # @param [Attachment] attachment The attachment containing the tests and files.
  def initialize(question, attachment)
    @question = question
    @attachment = attachment
  end

  # Imports the templates and tests found in the package.
  def import
    @attachment.open(binmode: true) do |temporary_file|
      begin
        package = Course::Assessment::ProgrammingPackage.new(temporary_file)
        import_from_package(package)
      ensure
        next unless package
        temporary_file.close
        package.close
      end
    end
  end

  # Imports the templates and tests from the given package.
  #
  # @param [Course::Assessment::ProgrammingPackage] package The package to import.
  def import_from_package(package)
    raise InvalidDataError unless package.valid?

    # Must extract template files before replacing them with the solution files.
    template_files = package.submission_files
    package.replace_submission_with_solution
    package.save
    evaluation_result = evaluate_package(package)

    raise evaluation_result if evaluation_result.error?
    save!(template_files, evaluation_result)
  end

  # Evaluates the package to obtain the set of tests.
  #
  # @param [Course::Assessment::ProgrammingPackage] package The package to import.
  # @return [Course::Assessment::ProgrammingEvaluationService::Result]
  def evaluate_package(package)
    Course::Assessment::ProgrammingEvaluationService.
      execute(@question.assessment.course, @question.language, @question.memory_limit,
              @question.time_limit, package.path)
  end

  # Saves the templates and tests to the question.
  #
  # @param [Hash<Pathname, String>] template_files The templates found in the package.
  # @param [Course::Assessment::ProgrammingEvaluationService::Result] evaluation_result The
  #   result of evaluating the package.
  def save!(template_files, evaluation_result)
    @question.imported_attachment = @attachment
    @question.template_files = build_template_file_records(template_files)
    @question.test_cases = build_combined_test_case_records(evaluation_result.test_reports)

    @question.save!
  end

  # Builds the template file records from the templates loaded from the package.
  #
  # @param [Hash<Pathname, String>] template_files The templates found in the package.
  # @return [Array<Course::Assessment::Question::ProgrammingTemplateFile>]
  def build_template_file_records(template_files)
    template_files.to_a.map do |(filename, content)|
      Course::Assessment::Question::ProgrammingTemplateFile.new(filename: filename.to_s,
                                                                content: content)
    end
  end

  # Goes through each test report file and combines all the test cases contained in them.
  #
  # @param [Hash<String, String>] test_reports The test reports from evaluating the package.
  #   Hash key is the report type, followed by the contents of the report.
  #   e.g. { 'public': <XML from public tests>, 'private': <XML from private tests> }
  # @return [Array<Course::Assessment::Question::ProgrammingTestCase>]
  def build_combined_test_case_records(test_reports)
    test_cases = []

    test_reports.values.each do |test_report|
      test_cases += build_test_case_records(test_report)
    end

    test_cases
  end

  # Builds the test case records from a single test report.
  #
  # @param [String] test_report The test case report from evaluating the package.
  # @return [Array<Course::Assessment::Question::ProgrammingTestCase>]
  def build_test_case_records(test_report)
    test_cases = parse_test_report(test_report)
    test_cases.map do |test_case|
      @question.test_cases.build(identifier: test_case.identifier,
                                 test_case_type: infer_test_case_type(test_case.name),
                                 expression: test_case.expression,
                                 expected: test_case.expected,
                                 hint: test_case.hint)
    end
  end

  # Figures out what kind of test case it is from the name
  #
  # @param [String] test_case_name The name of the test case.
  # @return [Symbol]
  def infer_test_case_type(test_case_name)
    if test_case_name =~ /public/i
      :public_test
    elsif test_case_name =~ /evaluation/i
      :evaluation_test
    elsif test_case_name =~ /private/i
      :private_test
    end
  end

  # Parses the test report for test cases and statuses.
  #
  # @param [String] test_report The test case report from evaluating the package.
  # @return [Array<>]
  def parse_test_report(test_report)
    if @question.language.is_a?(Coursemology::Polyglot::Language::Java)
      Course::Assessment::Java::JavaProgrammingTestCaseReport.new(test_report).test_cases
    else
      Course::Assessment::ProgrammingTestCaseReport.new(test_report).test_cases
    end
  end
end
