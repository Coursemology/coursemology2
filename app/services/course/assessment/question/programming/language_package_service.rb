# frozen_string_literal: true
# In charge of the programming package of the question when using the online editor. This will
# generate a package based on the parameters from the online editor for autograded questions, or
# extract the template files from the parameters for non-autograded questions.
#
# This also extracts the meta details of the programming question, the meta is a JSON used by the
# online editor for rendering. This meta will be stored in the package for autograded questions, or
# generated using the existing template files and the default meta for non-autograded questions.
class Course::Assessment::Question::Programming::LanguagePackageService
  # A concrete language package service will be initalized with the request parameters from the
  # controller when creating/updating the programming question, the language package service
  # will use the parameters to create/update the package.
  #
  # When using the service only to retrieve the meta for a programming question, the params
  # argument can be nil.
  #
  # @param [ActionController::Parameters] params The parameters containing the data for package
  #   generation.
  def initialize(params)
    @test_params = test_params params if params.present?
  end

  # Checks whether the programming question should be autograded.
  #
  # @return [Boolean]
  def autograded?
    @test_params.key?(:autograded)
  end

  # Array of arguments used to create template files for non-autograded programming question.
  #
  # @return [Array]
  def submission_templates
    raise NotImplementedError, 'You must implement this'
  end

  # Generates a new package with the meta file.
  #
  # @param [AttachmentReference] Previous package, may contain files that the new package uses.
  # @return [Tempfile]
  def generate_package(old_attachment) # rubocop:disable UnusedMethodArgument
    raise NotImplementedError, 'You must implement this'
  end

  # Defines the default meta to be used by the online editor for rendering.
  #
  # @return [Hash]
  def default_meta
    {
      submission: '', solution: '', prepend: '', append: '',
      data_files: [],
      test_cases: {
        public: [],
        private: [],
        evaluation: []
      }
    }
  end

  # Retrieves the meta details from the programming package, or the template files if the package
  # does not exist for non-autograded questions.
  #
  # @param [AttachmentReference] Package containing the meta details.
  # @param [Array<Course::Assessment::Question::ProgrammingTemplateFile>] An Array of template
  #   files used to generate meta for non-autograded questions.
  # @return [Hash]
  def extract_meta(attachment, template_files) # rubocop:disable UnusedMethodArgument
    raise NotImplementedError, 'You must implement this'
  end

  private

  # Permits the fields that are used to generate a the package for the language.
  #
  # @param [ActionController::Parameters] params The parameters containing the data for package
  #   generation.
  def test_params(params)
    test_params = params.require(:question_programming).permit(
      :prepend, :append, :solution, :submission, :autograded,
      data_files: [],
      test_cases: {
        public: [:expression, :expected, :hint],
        private: [:expression, :expected, :hint],
        evaluation: [:expression, :expected, :hint]
      }
    )
    whitelist(params, test_params)
  end

  def whitelist(params, test_params)
    test_params.tap do |whitelisted|
      whitelisted[:data_files_to_delete] = params['question_programming']['data_files_to_delete']
    end
  end

  # Checks that the test case field is meant to be a string.
  #
  # @param [String]
  # @return [Boolean]
  def string?(text)
    text.first == '\'' && text.last == '\'' ||
      text.first == '"' && text.last == '"'
  end
end
