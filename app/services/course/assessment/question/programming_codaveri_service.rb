# frozen_string_literal: true
# Creates or updates codaveri programming problem from the attachment/package imported to the programming question.
# This extracts the information (eg. language, solution files and test cases) required for creation of codaveri problem.
class Course::Assessment::Question::ProgrammingCodaveriService
  class << self
    # Create or update the programming question attachment to Codaveri.
    #
    # @param [Course::Assessment::Question::Programming] question The programming question to
    #   be created in the Codaveri service.
    # @param [Attachment] attachment The attachment containing the package to be converted and sent to Codaveri.
    def create_or_update_question(question, attachment)
      new(question, attachment).create_or_update_question
    end
  end

  # Opens the attachment, converts it into a programming package, extracts and converts required information
  # to be sent to Codaveri.
  def create_or_update_question
    @attachment.open(binmode: true) do |temporary_file|
      package = Course::Assessment::ProgrammingPackage.new(temporary_file)
      create_or_update_from_package(package)
    ensure
      next unless package

      temporary_file.close
      package.close
    end
  end

  private

  # Creates a new service question creation object.
  #
  # @param [Course::Assessment::Question::Programming] question The programming question to be created.
  # @param [Attachment] attachment The attachment containing the tests and files.
  def initialize(question, attachment)
    @question = question
    @is_update_problem = @question.codaveri_id.present?
    @attachment = attachment
    @problem_object = {
      courseName: question.question_assessments.first.assessment.course.title,
      title: @question.title,
      description: @question.description,
      resources: [
        {
          languageVersions: { language: '', versions: [] },
          templates: [],
          solutions: [
            {
              tag: 'default',
              files: []
            }
          ],
          exprTestcases: []
        }
      ],
      additionalFiles: [],
      IOTestcases: []
    }
  end

  # Constructs codaveri question problem object and send an API request to Codaveri to create/update the question.
  #
  # @param [Course::Assessment::ProgrammingPackage] package The programming package attached to the question.
  def create_or_update_from_package(package)
    construct_problem_object(package)

    @is_update_problem ? update_codaveri_problem : create_codaveri_problem
  end

  # Constructs codaveri question problem object.
  #
  # @param [Course::Assessment::ProgrammingPackage] package The programming package attached to the question.
  def construct_problem_object(package) # rubocop:disable Metrics/AbcSize
    @problem_object[:problemId] = @question.codaveri_id if @is_update_problem

    @problem_object[:title] = @question.title
    @problem_object[:description] = @question.description
    resources_object = @problem_object[:resources][0]
    resources_object[:languageVersions][:language] = @question.language.polyglot_name
    resources_object[:languageVersions][:versions] = [@question.language.polyglot_version]

    codaveri_package = Course::Assessment::Question::ProgrammingCodaveri::ProgrammingCodaveriPackageService.new(
      @question, package
    )

    resources_object[:solutions][0][:files] = codaveri_package.process_solutions
    all_test_cases = codaveri_package.process_test_cases
    @problem_object[:IOTestcases] = all_test_cases.filter { |tc| tc[:type] == 'io' }
    @problem_object.delete(:IOTestcases) if @problem_object[:IOTestcases].empty?
    resources_object[:exprTestcases] = all_test_cases.filter { |tc| tc[:type] == 'expression' }
    resources_object.delete(:exprTestcases) if resources_object[:exprTestcases].empty?
    resources_object[:templates] = codaveri_package.process_templates
    @problem_object[:additionalFiles] = codaveri_package.process_data

    @problem_object
  end

  def create_codaveri_problem
    codaveri_api_service = CodaveriAsyncApiService.new('problem', @problem_object)
    response_status, response_body = codaveri_api_service.post

    handle_codaveri_response(response_status, response_body)
  end

  def update_codaveri_problem
    codaveri_api_service = CodaveriAsyncApiService.new('problem', @problem_object)
    response_status, response_body = codaveri_api_service.put

    handle_codaveri_response(response_status, response_body)
  end

  def handle_codaveri_response(status, body)
    success = body['success']
    message = body['message']

    if status == 200 && success
      problem_id = body['data']['id']
      @question.update!(codaveri_id: problem_id, codaveri_status: status,
                        codaveri_message: message, is_synced_with_codaveri: true)
    else
      @question.update!(codaveri_id: nil, codaveri_status: status, codaveri_message: message,
                        is_synced_with_codaveri: false)

      raise CodaveriError, "Codevari Error: #{message}"
    end
  end
end
