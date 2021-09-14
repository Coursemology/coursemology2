# frozen_string_literal: true
# Generates the package and extracts the meta for the programming question based on the language
# of the programming question.
class Course::Assessment::Question::Programming::ProgrammingPackageService
  # Creates a new programming package service object.
  #
  # @param [Course::Assessment::Question::Programming] question The programming question with the
  #   programming package.
  def initialize(question, params)
    @question = question
    @language = question.language
    @template_files = question.template_files

    init_language_package_service(params)
  end

  # Generates a programming package from the parameters which were passed to the controller.
  def generate_package
    if @language_package_service.autograded?
      new_package = @language_package_service.generate_package(@question.attachment)
      @question.file = new_package if new_package.present?
    else
      templates = @language_package_service.submission_templates
      @question.imported_attachment = nil
      @question.import_job_id = nil
      @question.non_autograded_template_files = templates.map do |template|
        Course::Assessment::Question::ProgrammingTemplateFile.new(template)
      end
    end
  end

  # Retrieves the meta details from the programming package.
  #
  # @return [Hash]
  def extract_meta
    data = @language_package_service.extract_meta(@question.attachment, @template_files)
    { editor_mode: @language.ace_mode, data: data } if data.present?
  end

  private

  def init_language_package_service(params)
    @language_package_service =
      if @language.is_a?(Coursemology::Polyglot::Language::Python)
        Course::Assessment::Question::Programming::Python::PythonPackageService.new params
      elsif @language.is_a?(Coursemology::Polyglot::Language::CPlusPlus)
        Course::Assessment::Question::Programming::Cpp::CppPackageService.new params
      elsif @language.is_a?(Coursemology::Polyglot::Language::Java)
        Course::Assessment::Question::Programming::Java::JavaPackageService.new params
      else
        raise NotImplementedError
      end
  end
end
