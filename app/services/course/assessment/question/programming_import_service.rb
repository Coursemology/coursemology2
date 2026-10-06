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
    # @param [Hash{String => Object}, nil] previous_version The question's column values before the edit that
    #   led to this import, with +superseder_id+ set to whoever made that edit. When omitted, the question's
    #   current values are taken as the previous version, with no superseder.
    # @param [String, nil] import_job_id The id of the job running this import, as recorded on the question by the
    #   edit that scheduled it. The import applies only while the question still records it. When omitted, the
    #   import always applies.
    # @return [Boolean] Whether the package was imported: false when the import was superseded by a later edit, in
    #   which case nothing was changed.
    def import(question, attachment, previous_version = nil, import_job_id: nil)
      new(question, attachment, previous_version, import_job_id).import
    end
  end

  # Imports the templates and tests found in the package.
  #
  # @return [Boolean] See .import.
  def import
    # Checked here as well as when saving, to skip evaluating a package that will not be applied.
    return false unless current_import?(Course::Assessment::Question::Programming.unscoped.
                                        where(id: @question.id).pick(:import_job_id))

    imported = false
    @attachment.open(binmode: true) do |temporary_file|
      package = Course::Assessment::ProgrammingPackage.new(temporary_file)
      imported = import_from_package(package)
    ensure
      next unless package

      temporary_file.close
      package.close
    end
    imported
  end

  private

  # Creates a new service import object.
  #
  # @param [Course::Assessment::Question::Programming] question The programming question for import.
  # @param [Attachment] attachment The attachment containing the tests and files.
  # @param [Hash{String => Object}, nil] previous_version See .import.
  # @param [String, nil] import_job_id See .import.
  def initialize(question, attachment, previous_version = nil, import_job_id = nil)
    @question = question
    @attachment = attachment
    @previous_version = previous_version
    @import_job_id = import_job_id
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

    test_reports = if @question.language.default_evaluator_whitelisted?
                     evaluation_result = evaluate_package(package)

                     raise evaluation_result if evaluation_result.error?

                     evaluation_result.test_reports
                   else
                     package.test_reports
                   end

    save!(template_files, test_reports)
  end

  # Evaluates the package to obtain the set of tests.
  #
  # @param [Course::Assessment::ProgrammingPackage] package The package to import.
  # @return [Course::Assessment::ProgrammingEvaluationService::Result]
  def evaluate_package(package)
    Course::Assessment::ProgrammingEvaluationService.
      execute(@question.language, @question.memory_limit, @question.time_limit, @question.max_time_limit, package.path)
  end

  # Saves the templates and tests to the question.
  #
  # @param [Hash<Pathname, String>] template_files The templates found in the package.
  # @param [Hash<String, String>] test_reports The test reports from evaluating the package.
  #   Hash key is the report type, followed by the contents of the report.
  #   e.g. { 'public': <XML from public tests>, 'private': <XML from private tests> }
  # @return [Boolean] See .import.
  def save!(template_files, test_reports)
    @question.class.transaction do
      # One change to the package at a time, and only the latest: see ProgrammingImportsConcern. Everything below
      # reads the question afresh under the lock, so it sees any import that committed while this one evaluated.
      next false unless current_import?(@question.lock_package!)

      snapshot_previous_version
      @question.imported_attachment = @attachment
      @question.template_files = build_template_file_records(template_files)
      @question.test_cases = build_combined_test_case_records(test_reports)
      # Codaveri still has the previous version until this one is pushed.
      @question.is_synced_with_codaveri = false

      @question.skip_process_package = true # Skip package re-processing
      @question.save!
      true
    end
  end

  # Whether this import is still the one the question's latest edit scheduled.
  #
  # @param [String, nil] recorded_import_job_id The question's import job id, as recorded now.
  def current_import?(recorded_import_job_id)
    @import_job_id.nil? || recorded_import_job_id == @import_job_id
  end

  # Keeps the version this import replaces as a snapshot, instead of letting the assignments in #save! destroy
  # its test cases and template files.
  #
  # The live question must never be committed without test cases: grading would then treat it as not
  # auto-gradable and award full marks. Hence the snapshot is taken in the transaction that assigns the new ones.
  # +superseded_at+ is when this import replaced the version, not when the edit that queued it was saved.
  #
  # While a newly uploaded package waits for import, the question holds references to both packages, so the
  # previous package is the one that is not being imported.
  def snapshot_previous_version
    previous_package = @question.attachment_references.where.not(id: @attachment.id).take || @attachment
    @question.snapshot_current_version!(@previous_version || @question.attributes, previous_package)
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

    test_reports.each_value do |test_report|
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
    case test_case_name
    when /public/i
      :public_test
    when /evaluation/i
      :evaluation_test
    when /private/i
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
