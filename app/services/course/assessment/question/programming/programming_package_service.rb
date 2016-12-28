# frozen_string_literal: true
# Generates the package and extracts the meta for the programming question based on the language
# of the programming question.
class Course::Assessment::Question::Programming::ProgrammingPackageService
  # Creates a new programming package service object.
  #
  # @param [Course::Assessment::Question::Programming] question The programming question with the
  #   programming package.
  def initialize(question)
    @question = question
    @language = question.language
    @current_attachment = question.attachment

    if python_language
      @language_package_service =
        Course::Assessment::Question::Programming::Python::PythonPackageService.new
      @editor_mode = 'python'
    else
      raise NotImplementedError
    end
  end

  # Generates a programming package from the parameters which were passed to the controller.
  #
  # @param [ActionController::Parameters] params The parameters containing the data for package
  #   generation.
  def generate_package(params)
    if @language_package_service.autograded?(params)
      new_package = @language_package_service.generate_package(@current_attachment, params)
      @question.file = new_package if new_package.present?
    else
      template = @language_package_service.submission_template(params)
      @question.imported_attachment = nil
      @question.template_files =
        [Course::Assessment::Question::ProgrammingTemplateFile.new(template)]
    end
  end

  # Retrieves the meta details from the programming package.
  #
  # @return [Hash]
  def extract_meta
    # attachment will be nil if the question is not autograded, in that case the meta data will be
    # generated from the template files in the database.
    if @current_attachment.nil?
      data = @language_package_service.generate_non_autograded_meta(@question.template_files)
    else
      data = @language_package_service.extract_meta(@current_attachment)
    end

    { editor_mode: @editor_mode, data: data } if data.present?
  end

  private

  # Checks that the language is Python, regardless of Python2 or Python3
  #
  # @return [Boolean]
  def python_language
    @language.is_a?(Coursemology::Polyglot::Language::Python)
  end
end
