# frozen_string_literal: true
# Generates the package and extracts the meta for the programming question based on the language
# of the programming question.
class Course::Assessment::Question::Programming::ProgrammingPackageService
  # Creates a new programming package service object.
  #
  # @param [Course::Assessment::Question::Programming] question The programming question with the
  #   programming package.
  def initialize(question)
    @language = question.language
    @current_attachment = question.attachment

    if python_language
      @language_package_service = Course::Assessment::Question::Programming::Python::PythonPackageService.new
      @editor_mode = 'python'
    else
      raise NotImplementedError
    end
  end

  # Generates a programming package from the parameters which were passed to the controller.
  #
  # @param [ActionController::Parameters] params The parameters containing the data for package
  #   generation.
  # @yield The package will be yielded to the provided block, and the block can save the package.
  # @yieldparam [Tempfile] new_package The package to save.
  def generate_package(params)
    new_package = @language_package_service.generate_package(@current_attachment, params)
    yield new_package if new_package.present?
  end

  # Retrieves the meta details from the programming package.
  #
  # @return [Hash]
  def extract_meta
    data = @language_package_service.extract_meta(@current_attachment)
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
