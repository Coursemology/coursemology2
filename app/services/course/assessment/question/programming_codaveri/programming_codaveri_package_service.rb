# frozen_string_literal: true
# Generates the codaveri package question payload.
class Course::Assessment::Question::ProgrammingCodaveri::ProgrammingCodaveriPackageService
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

  private

  # @param [Course::Assessment::Question::Programming] question The programming question with the
  #   programming package.
  # @param [Course::Assessment::ProgrammingPackage] package The imported package.
  def init_language_codaveri_package_service(question, package)
    @language_codaveri_package_service =
      case @language
      when Coursemology::Polyglot::Language::Python
        Course::Assessment::Question::ProgrammingCodaveri::Python::PythonPackageService.new question, package
      else
        raise NotImplementedError
      end
  end
end
