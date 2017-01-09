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
    @current_attachment = question.attachment
    @template_files = question.template_files

    init_language_package_service(params)
  end

  # Generates a programming package from the parameters which were passed to the controller.
  def generate_package
    if @language_package_service.autograded?
      new_package = @language_package_service.generate_package(@current_attachment)
      @question.file = new_package if new_package.present?
    else
      templates = @language_package_service.submission_templates
      @question.imported_attachment = nil
      @question.non_autograded_template_files = templates.map do |template|
        Course::Assessment::Question::ProgrammingTemplateFile.new(template)
      end
    end
  end

  # Retrieves the meta details from the programming package.
  #
  # @return [Hash]
  def extract_meta
    data = @language_package_service.extract_meta(@current_attachment, @template_files)
    { editor_mode: @editor_mode, data: data } if data.present?
  end

  private

  def init_language_package_service(params)
    if python_language
      @language_package_service =
        Course::Assessment::Question::Programming::Python::PythonPackageService.new params
      @editor_mode = 'python'
    elsif javascript_language
      raise NotImplementedError
    else
      raise NotImplementedError
    end
  end

  # Checks that the language is Python, regardless of Python2 or Python3
  #
  # @return [Boolean]
  def python_language
    @language.is_a?(Coursemology::Polyglot::Language::Python)
  end

  # Checks that the language is Javascript
  #
  # @return [Boolean]
  def javascript_language
    @language.is_a?(Coursemology::Polyglot::Language::JavaScript)
  end
end
