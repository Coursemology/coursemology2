# frozen_string_literal: true
# Generates the codaveri package question payload.
class Course::Assessment::Question::ProgrammingCodaveri::ProgrammingCodaveriPackageService
  class << self
    # Files to send to Codaveri ahead of an answer's own files, which the student did not write, such as
    # the main script of a multi-file Python question. Codaveri runs the first file as the main script.
    #
    # @param [Course::Assessment::Question::Programming] question
    # @return [Array<Hash>] Each file's path and content. Empty for most questions, without opening the
    #   question's package.
    def generated_answer_files(question)
      return [] unless question.attachment &&
                       language_codaveri_package_service_class(question.language).generates_answer_files?(question)

      question.attachment.open(binmode: true) do |temporary_file|
        package = Course::Assessment::ProgrammingPackage.new(temporary_file)
        new(question, package).generated_answer_files
      ensure
        package&.close
      end
    end

    # @param [Coursemology::Polyglot::Language] language
    # @return [Class] The language's Codaveri package service.
    def language_codaveri_package_service_class(language)
      case language
      when Coursemology::Polyglot::Language::Python
        Course::Assessment::Question::ProgrammingCodaveri::Python::PythonPackageService
      when Coursemology::Polyglot::Language::R
        Course::Assessment::Question::ProgrammingCodaveri::R::RPackageService
      when Coursemology::Polyglot::Language::Java
        Course::Assessment::Question::ProgrammingCodaveri::Java::JavaPackageService
      when Coursemology::Polyglot::Language::CSharp
        Course::Assessment::Question::ProgrammingCodaveri::CSharp::CSharpPackageService
      when Coursemology::Polyglot::Language::JavaScript
        Course::Assessment::Question::ProgrammingCodaveri::JavaScript::JavaScriptPackageService
      when Coursemology::Polyglot::Language::Go
        Course::Assessment::Question::ProgrammingCodaveri::Go::GoPackageService
      when Coursemology::Polyglot::Language::Rust
        Course::Assessment::Question::ProgrammingCodaveri::Rust::RustPackageService
      when Coursemology::Polyglot::Language::TypeScript
        Course::Assessment::Question::ProgrammingCodaveri::TypeScript::TypeScriptPackageService
      else
        raise NotImplementedError
      end
    end
  end

  # Creates a new programming package service object.
  #
  # @param [Course::Assessment::Question::Programming] question The programming question with the
  #   programming package.
  # @param [Course::Assessment::ProgrammingPackage] package The imported package.
  def initialize(question, package)
    @question = question
    @language = question.language
    @package = package

    init_language_codaveri_package_service(question, package)
  end

  def process_solutions
    @language_codaveri_package_service.process_solutions
    @language_codaveri_package_service.solution_files
  end

  def process_test_cases
    @language_codaveri_package_service.process_test_cases
    @language_codaveri_package_service.test_case_files
  end

  def process_templates
    @language_codaveri_package_service.process_templates
    @language_codaveri_package_service.template_files
  end

  def process_data
    @language_codaveri_package_service.process_data
    @language_codaveri_package_service.data_files
  end

  def process_evaluator
    @language_codaveri_package_service.process_evaluator
    @language_codaveri_package_service.evaluator_config
  end

  def generated_answer_files
    @language_codaveri_package_service.generated_answer_files
  end

  private

  # @param [Course::Assessment::Question::Programming] question The programming question with the
  #   programming package.
  # @param [Course::Assessment::ProgrammingPackage] package The imported package.
  def init_language_codaveri_package_service(question, package)
    @language_codaveri_package_service = self.class.language_codaveri_package_service_class(@language).
                                         new(question, package)
  end
end
