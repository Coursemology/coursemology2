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
    @solution_files = []
    @test_case_files = []
  end

  attr_reader :solution_files, :test_case_files

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

  private

  # Defines the default solution template as indicated in the Codevari API problem management spec.
  #
  # @return [Hash]
  def default_codaveri_solution_template
    {
      path: '',
      prefix: '',
      content: '',
      suffix: ''
    }
  end

  # Defines the default test case template as indicated in the Codevari API problem management spec.
  #
  # @return [Hash]
  def default_codaveri_test_case_template
    {
      index: '',
      type: 'expression',
      timeout: '',
      prefix: '',
      expression: '',
      display: 'str(out)'
    }
  end
end
