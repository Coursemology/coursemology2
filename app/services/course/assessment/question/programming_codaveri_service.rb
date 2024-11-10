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
      new(question, attachment).create_question
    end
  end

  # Opens the attachment, converts it into a programming package, extracts and converts required information
  # to be sent to Codaveri.
  def create_question
    @attachment.open(binmode: true) do |temporary_file|
      package = Course::Assessment::ProgrammingPackage.new(temporary_file)
      create_from_package(package)
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
      additionalFiles: []
    }
  end

  # Constructs codaveri question problem object and send an API request to Codaveri to create/update the question.
  #
  # @param [Course::Assessment::ProgrammingPackage] package The programming package attached to the question.
  def create_from_package(package)
    construct_problem_object(package)
    create_codaveri_problem
  end

  # Constructs codaveri question problem object.
  #
  # @param [Course::Assessment::ProgrammingPackage] package The programming package attached to the question.
  def construct_problem_object(package) # rubocop:disable Metrics/AbcSize
    @problem_object[:title] = @question.title
    @problem_object[:description] = @question.description
    resources_object = @problem_object[:resources][0]
    resources_object[:languageVersions][:language] = @question.language.polyglot_name
    resources_object[:languageVersions][:versions] = [@question.language.polyglot_version]

    codaveri_package = Course::Assessment::Question::ProgrammingCodaveri::ProgrammingCodaveriPackageService.new(
      @question, package
    )

    resources_object[:solutions][0][:files] = codaveri_package.process_solutions
    resources_object[:exprTestcases] = codaveri_package.process_test_cases
    resources_object[:templates] = codaveri_package.process_templates
    @problem_object[:additionalFiles] = codaveri_package.process_data

    @problem_object
    # For debugging purpose
    # File.write('codaveri_problem_management_test.json', @problem_object.to_json)
  end

  def create_codaveri_problem
    codaveri_api_service = CodaveriAsyncApiService.new('v2/problem', @problem_object)
    response_status, response_body = codaveri_api_service.post

    response_success = response_body['success']
    response_message = response_body['message']

    if response_status == 200 && response_success
      response_problem_id = response_body['data']['id']
      @question.update!(codaveri_id: response_problem_id, codaveri_status: response_status,
                        codaveri_message: response_message)
    else
      @question.update!(codaveri_id: nil, codaveri_status: response_status, codaveri_message: response_message)

      raise CodaveriError, "Codevari Error: #{response_message}"
    end
  end
end
