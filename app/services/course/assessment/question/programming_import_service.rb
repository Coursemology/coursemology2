# Imports the provided programming package into the question. This evaluates the package to
# obtain the set of tests, as well as extracts the templates from the package to be stored
# together with the question.
class Course::Assessment::Question::ProgrammingImportService
  class << self
    # Imports the programming package into the question.
    #
    # @raise [InvalidDataError] When the package is not a valid package.
    #
    # @overload import(question, package)
    #   @param [Course::Assessment::Question::Programming] question The programming question for
    #     import.
    #   @param [Course::Assessment::ProgrammingPackage] package The package containing the
    #     tests and template files.
    #
    # @overload import(question, package_path)
    #   @param [Course::Assessment::Question::Programming] question The programming question for
    #     import.
    #   @param [String] package_path The path to the package containing the tests and template
    # files.
    #
    # @overload import(question, package_stream)
    #   @param [Course::Assessment::Question::Programming] question The programming question for
    #     import.
    #   @param [IO] package_stream An I/O object containing the package.
    def import(question, package)
      package = Course::Assessment::ProgrammingPackage.new(package) unless \
        package.is_a?(Course::Assessment::ProgrammingPackage)
      new(question, package).send(:import)
    end
  end

  private

  # Creates a new service import object.
  #
  # @param [Course::Assessment::Question::Programming] question The programming question for import.
  # @param [Course::Assessment::ProgrammingPackage] package The package containing the tests and
  #   template files.
  def initialize(question, package)
    @question = question
    @package = package
  end

  # Imports the templates and tests found in the package.
  def import
    fail InvalidDataError unless @package.valid?

    template_import_thread = Thread.new { import_template_files }
    evaluation_result = evaluate_package
    template_import_thread.join

    save(template_import_thread.value, evaluation_result)
  end

  # Extracts the templates from the package.
  #
  # @return [Hash<Pathname, String>] The templates found in the package.
  def import_template_files
    @package.submission_files
  end

  # Evaluates the package to obtain the set of tests.
  #
  # @return [Course::Assessment::ProgrammingEvaluationService::Result]
  def evaluate_package
    Course::Assessment::ProgrammingEvaluationService.
      execute(@question.assessment.course, @question.language, @question.memory_limit,
              @question.time_limit, @package.path)
  end

  # Saves the templates and tests to the question.
  #
  # @param [Hash<Pathname, String>] template_files The templates found in the package.
  # @param [Course::Assessment::ProgrammingEvaluationService::Result] evaluation_result The
  #   result of evaluating the package.
  def save(template_files, evaluation_result)
    @question.template_files = build_template_file_records(template_files)
    @question.test_cases = build_test_case_records(evaluation_result.test_report)

    @question.save
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

  # Builds the test case records from the test report.
  #
  # @param [String] test_report The test case report from evaluating the package.
  # @return [Array<Course::Assessment::Question::ProgrammingTestCase>]
  def build_test_case_records(test_report)
    test_cases = parse_test_report(test_report)
    test_cases.map do |test_case|
      @question.test_cases.build(identifier: test_case.identifier,
                                 public: !(test_case.name =~ /public/i).nil?,
                                 description: test_case.name)
    end
  end

  # Parses the test report for test cases and statuses.
  #
  # @param [String] test_report The test case report from evaluating the package.
  # @return [Array<>]
  def parse_test_report(test_report)
    Course::Assessment::ProgrammingTestCaseReport.new(test_report).test_cases
  end
end
