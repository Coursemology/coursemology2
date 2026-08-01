# frozen_string_literal: true
# In charge of extracting programming package and converting the package into the payload to be sent to codaveri.
class Course::Assessment::Question::ProgrammingCodaveri::LanguagePackageService
  # A concrete language package service will be initalized with the request parameters from the
  # controller when creating/updating the programming question, the language package service
  # will use the parameters to create/update the package.
  #
  # @param [Course::Assessment::Question::Programming] question The programming question with the
  #   programming package.
  # @param [Course::Assessment::ProgrammingPackage] package The imported package.
  def initialize(question, package)
    @question = question
    @package = package
    # currently codebase only supports one solution for now
    # but in the future, we may consider supporting multiple solutions
    # e.g. iterative/recursive solutions, naive/optimal solutions
    @solution_files = []
    @test_case_files = []
    @template_files = []
    @data_files = []
    @evaluator_config = {}
  end

  attr_reader :solution_files, :test_case_files, :template_files, :data_files, :evaluator_config

  # Returns an array containing the solution files for Codaveri problem object.
  #
  # @return [Array]
  def process_solutions
    raise NotImplementedError, 'You must implement this'
  end

  # Returns an array containing the test cases for Codaveri problem object.
  #
  # @return [Array]
  def process_test_cases
    raise NotImplementedError, 'You must implement this'
  end

  # Returns an array containing the template files for Codaveri problem object.
  #
  # @return [Array]
  def process_templates
    raise NotImplementedError, 'You must implement this'
  end

  # Returns an array containing the additional data files for Codaveri problem object.
  #
  # @return [Array]
  def process_data
    raise NotImplementedError, 'You must implement this'
  end

  # Returns the EvaluatorConfig for Codaveri problem object.
  # Expected to be overriden in the concrete language package service if needed.
  #
  # @return [Hash]
  def process_evaluator
    {}
  end

  private

  # Extracts filename and content of a data file and append it to the
  # [:additionalFiles] array for the problem management API request body.
  #
  # @param [Pathname] filename The pathname of the file.
  # @param [String] content The content of the file.
  def extract_supporting_file(filename, content)
    supporting_file_object = default_codaveri_data_file_template

    supporting_file_object[:type] = 'internal' # 'external' s3 upload not yet implemented by codaveri
    supporting_file_object[:path] = filename.to_s
    # `content` is read straight out of the zip and may be frozen (rubyzip returns a frozen empty
    # string literal for zero-byte entries), so tag the encoding on a copy rather than in place.
    utf8_content = content.dup.force_encoding('UTF-8')
    if utf8_encodable?(filename, utf8_content)
      supporting_file_object[:content] = utf8_content
      supporting_file_object[:encoding] = 'utf8'
    else
      supporting_file_object[:content] = Base64.strict_encode64(content)
      supporting_file_object[:encoding] = 'base64'
    end

    @data_files.append(supporting_file_object)
  end

  # Whether a supporting file may be sent to Codaveri as plaintext 'utf8' rather than 'base64'.
  # Concrete services may narrow this further; see the Java package service.
  #
  # @param [Pathname] filename The pathname of the file.
  # @param [String] utf8_content The content of the file, tagged as UTF-8.
  # @return [Boolean]
  def utf8_encodable?(_filename, utf8_content)
    utf8_content.valid_encoding?
  end

  # Defines the default solution template as indicated in the Codevari API problem management spec.
  #
  # @return [Hash]
  def default_codaveri_solution_template
    {
      path: '',
      content: ''
    }
  end

  # Defines the default expression test case template as indicated in the Codevari API problem management spec.
  #
  # @return [Hash]
  def default_codaveri_expr_test_case_template
    {
      index: '',
      type: 'expression',
      prefix: '',
      display: 'str(out)'
    }
  end

  # Defines the default test case template as indicated in the Codevari API problem management spec.
  #
  # @return [Hash]
  def default_codaveri_io_test_case_template
    {
      index: '',
      type: 'io',
      input: '',
      output: '',
      visibility: '',
      hint: '',
      display: 'str(out)'
    }
  end

  # Defines the default template file template as indicated in the Codevari API problem management spec.
  #
  # @return [Hash]
  def default_codaveri_template_template
    {
      path: '',
      prefix: '',
      content: '',
      suffix: ''
    }
  end

  # Defines the default data / additional file template as indicated in the Codevari API problem management spec.
  #
  # @return [Hash]
  def default_codaveri_data_file_template
    {
      type: '',
      path: '',
      content: '',
      encoding: ''
    }
  end
end
