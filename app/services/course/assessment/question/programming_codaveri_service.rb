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
    @problem_object = { api_version: 'latest',
                        language_version: { language: '', version: '' },
                        files_solution: [],
                        testcases: [] }
  end

  # Constructs codaveri question problem object and send an API request to Codaveri to create/update the question.
  #
  # @param [Course::Assessment::ProgrammingPackage] package The programming package attached to the question.
  def create_or_update_from_package(package)
    construct_problem_object(package)
    create_codaveri_problem
  end

  # Constructs codaveri question problem object.
  #
  # @param [Course::Assessment::ProgrammingPackage] package The programming package attached to the question.
  def construct_problem_object(package)
    @problem_object[:problem_id] = @question.codaveri_id if @question.codaveri_id

    @problem_object[:language_version][:language] = @question.polyglot_language_name
    @problem_object[:language_version][:version] = @question.polyglot_language_version

    codaveri_package = Course::Assessment::Question::ProgrammingCodaveri::ProgrammingCodaveriPackageService.new(
      @question, package
    )

    @problem_object[:files_solution] = codaveri_package.process_solutions
    @problem_object[:testcases] = codaveri_package.process_test_cases

    # For debugging purpose
    File.write('codaveri_problem_management_test.json', @problem_object.to_json)
  end

  # Returns language name in lowercase format (eg python, java).
  #
  # @param [String] language_name The programming language full name (eg Python 2.7, Java 11, etc).
  # @return [String] The language name in lowercase format.
  def extract_language_name(language_name)
    language_name.split[0].downcase
  end

  # Returns language version.
  #
  # @param [String] language_name The programming language full name (eg Python 2.7, Java 11, etc).
  # @return [String] The language version.
  def extract_language_version(language_name)
    language_name.split[1]
  end

  def create_codaveri_problem
    connection = Excon.new('https://api.codaveri.com/problem')
    post_response = connection.post(
      headers: {
        'x-api-key' => ENV['CODAVERI_API_KEY'],
        'Content-Type' => 'application/json'
      },
      body: @problem_object.to_json
    )

    response_status = post_response.status
    response_body = JSON.parse(post_response.body)
    response_success = response_body['success']
    response_message = response_body['message']

    if response_status == 200 && response_success
      response_problem_id = response_body['data']['problem_id']
      @question.update!(codaveri_id: response_problem_id, codaveri_status: response_status,
                        codaveri_message: response_message)
    else
      @question.update!(codaveri_id: nil, codaveri_status: response_status, codaveri_message: response_message)

      raise CodaveriError, "Codevari Error: #{response_message}"
    end
  end

  def update_codaveri_problem
    connection = Excon.new('https://api.codaveri.com/problem')
    post_response = connection.put(
      headers: {
        'x-api-key' => ENV['CODAVERI_API_KEY'],
        'Content-Type' => 'application/json'
      },
      body: @problem_object.to_json
    )

    response_status = post_response.status
    response_body = JSON.parse(post_response.body)
    response_success = response_body['success']
    response_message = response_body['message']

    @question.update!(codaveri_status: response_status, codaveri_message: response_message)

    raise CodaveriError, "Codevari Error: #{response_message}" if response_status != 200 && !response_success
  end
end
