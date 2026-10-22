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
    @test_params.key?(:autograded) && [true, 'true'].include?(@test_params[:autograded])
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
  def generate_package(old_attachment)
    raise NotImplementedError, 'You must implement this'
  end

  # Tells #generate_package that the question's language is changing, so that it builds a new
  # package even if the meta is the same: the previous package may have been built for another
  # language, whose package can have identical meta.
  def language_changed!
    @language_changed = true
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
  def extract_meta(attachment, template_files)
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

  # Whether the package generated from the parameters would be the same as the previous one.
  #
  # @return [Boolean]
  def package_unchanged?
    !@language_changed && @meta == @old_meta
  end

  # Whether the question creator provides the submission templates as uploaded files rather than as
  # code, for languages whitelisted for multiple file submission.
  #
  # @return [Boolean]
  def submit_as_file?
    @test_params[:submit_as_file] == 'true'
  end

  # The uploaded submission files, as template files for questions that are not autograded.
  #
  # @return [Array<Hash>]
  def uploaded_submission_templates
    (@test_params[:submission_files] || []).compact.map do |file|
      { filename: file.original_filename, content: File.read(file.tempfile.path) }
    end
  end

  # Finds the files of the given type in the previous package that the new package keeps: those not
  # deleted, and not replaced by an upload with the same name. Submission and solution files are only
  # kept when the templates are files, so switching a question to code drops them.
  #
  # @param [String] file_type 'data_files', 'submission_files' or 'solution_files'.
  # @param [AttachmentReference] attachment The previous package, if any.
  # @return [Array<File>]
  def find_files_to_keep(file_type, attachment)
    return [] if attachment.blank? || (file_type != 'data_files' && !submit_as_file?)

    new_filenames = (@test_params[file_type] || []).compact.map(&:original_filename)

    attachment.open(binmode: true) do |temporary_file|
      package = Course::Assessment::ProgrammingPackage.new(temporary_file)
      return extract_files_to_keep(package, file_type, new_filenames, @test_params["#{file_type}_to_delete"])
    ensure
      next unless package

      temporary_file.close
    end
  end

  def extract_files_to_keep(package, file_type, new_filenames, files_to_delete)
    return [] if @old_meta.blank?

    package.unzip_file @tmp_dir
    (@old_meta[file_type] || []).filter_map do |file|
      next if files_to_delete.try(:include?, file['filename'])
      # new files overrides old ones
      next if new_filenames.include?(file['filename'])

      File.new(File.join(package_folder_path(file_type), file['filename']))
    end
  end

  def package_folder_path(file_type)
    case file_type
    when 'submission_files'
      File.join(@tmp_dir, 'submission')
    when 'solution_files'
      File.join(@tmp_dir, 'solution')
    # Data files are in the root of the package
    else
      @tmp_dir
    end
  end

  # @param [String] file_type 'data_files', 'submission_files' or 'solution_files'.
  # @param [Array<File>] files_to_keep The files kept from the previous package.
  # @return [Array<Hash>] The name, size and hash of each file, sorted by name.
  def files_meta(file_type, files_to_keep)
    files = (@test_params[file_type] || []).compact.map do |file|
      { filename: file.original_filename, size: file.tempfile.size, hash: Digest::SHA256.file(file.tempfile).hexdigest }
    end

    files_to_keep.each do |file|
      files.append(filename: File.basename(file.path), size: file.size, hash: Digest::SHA256.file(file).hexdigest)
    end

    files.sort_by { |file| file[:filename].downcase }
  end

  def add_file_submission_meta(meta, submission_files_to_keep, solution_files_to_keep)
    meta[:submit_as_file] = submit_as_file?
    meta[:submission_files] = files_meta('submission_files', submission_files_to_keep)
    meta[:solution_files] = files_meta('solution_files', solution_files_to_keep)
  end

  def add_data_files(zip, data_files_to_keep)
    @test_params[:data_files]&.each do |file|
      next if file.nil?

      zip.add(file.original_filename, file.tempfile.path)
    end

    data_files_to_keep.each do |file|
      zip.add(File.basename(file.path), file.path)
    end
  end

  # Adds the submission and solution files of a package whose templates are files.
  def add_submission_and_solution_files(zip, submission_files_to_keep, solution_files_to_keep)
    { 'submission' => ['submission_files', submission_files_to_keep],
      'solution' => ['solution_files', solution_files_to_keep] }.each do |folder, (file_type, files_to_keep)|
      zip.mkdir(folder)
      @test_params[file_type]&.each do |file|
        next if file.nil?

        zip.add("#{folder}/#{file.original_filename}", file.tempfile.path)
      end

      files_to_keep.each do |file|
        zip.add("#{folder}/#{File.basename(file.path)}", file.path)
      end
    end
  end

  # Checks that the test case field is meant to be a string.
  #
  # @param [String]
  # @return [Boolean]
  def string?(text)
    (text.first == '\'' && text.last == '\'') ||
      (text.first == '"' && text.last == '"')
  end
end
