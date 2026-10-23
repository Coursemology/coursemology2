# frozen_string_literal: true
class Course::Assessment::Question::Programming::Python::PythonPackageService <
  Course::Assessment::Question::Programming::LanguagePackageService
  def submission_templates
    return uploaded_submission_templates if submit_as_file?

    [
      {
        filename: 'template.py',
        content: @test_params[:submission] || ''
      }
    ]
  end

  def generate_package(old_attachment)
    return nil if @test_params.blank?

    @tmp_dir = Dir.mktmpdir
    @old_meta = old_attachment.present? ? extract_meta(old_attachment, nil) : nil
    data_files_to_keep = find_files_to_keep('data_files', old_attachment)
    submission_files_to_keep = find_files_to_keep('submission_files', old_attachment)
    solution_files_to_keep = find_files_to_keep('solution_files', old_attachment)
    @meta = generate_meta(data_files_to_keep, submission_files_to_keep, solution_files_to_keep)

    return nil if package_unchanged?

    @attachment = generate_zip_file(data_files_to_keep, submission_files_to_keep, solution_files_to_keep)
    FileUtils.remove_entry @tmp_dir if @tmp_dir.present?
    @attachment
  end

  def extract_meta(attachment, template_files)
    return @meta if @meta.present? && attachment == @attachment

    # attachment will be nil if the question is not autograded, in that case the meta data will be
    # generated from the template files in the database.
    return generate_non_autograded_meta(template_files) if attachment.nil?

    extract_autograded_meta(attachment)
  end

  private

  # Packages saved before file submission lack its fields, so they are filled in from the defaults: the
  # form needs them, and the package must still compare as unchanged when saved as it is.
  def extract_autograded_meta(attachment)
    attachment.open(binmode: true) do |temporary_file|
      package = Course::Assessment::ProgrammingPackage.new(temporary_file)
      meta = package.meta_file
      @old_meta = meta.present? ? default_meta.as_json.merge(JSON.parse(meta)) : nil
    ensure
      next unless package

      temporary_file.close
    end
  end

  def generate_non_autograded_meta(template_files)
    meta = default_meta

    return meta if template_files.blank?

    # For python editor, there is only a single submission template file.
    meta[:submission] = template_files.first.content

    meta.as_json
  end

  def generate_zip_file(data_files_to_keep, submission_files_to_keep, solution_files_to_keep)
    tmp = Tempfile.new(['package', '.zip'])
    autograde_pre_path = get_file_path('python_autograde_pre.py')
    autograde_post_path = get_file_path('python_autograde_post.py')
    # With files, the student's code is imported by the tests rather than pasted into them.
    makefile_path = get_file_path(submit_as_file? ? 'python_standard_makefile' : 'python_makefile')

    Zip::OutputStream.open(tmp.path) do |zip|
      generate_template_submission_solution_files(zip) unless submit_as_file?

      # Create tests directory with prepend, append and autograde files
      zip.put_next_entry 'tests/'
      zip.put_next_entry 'tests/append.py'
      zip.print "\n"
      zip.print @test_params[:append]
      zip.print "\n"

      zip.put_next_entry 'tests/prepend.py'
      zip.print @test_params[:prepend]
      zip.print "\n"

      zip.put_next_entry 'tests/autograde.py'
      zip.print File.read(autograde_pre_path)

      [:public, :private, :evaluation].each do |test_type|
        zip_test_files(test_type, zip)
      end

      zip.print File.read(autograde_post_path)

      # Creates Makefile
      zip.put_next_entry 'Makefile'
      zip.print File.read(makefile_path)

      zip.put_next_entry '.meta'
      zip.print @meta.to_json
    end

    Zip::File.open(tmp.path) do |zip|
      add_submission_and_solution_files(zip, submission_files_to_keep, solution_files_to_keep) if submit_as_file?
      add_data_files(zip, data_files_to_keep)
    end

    tmp
  end

  # Writes the submission template and solution written in the code editors.
  def generate_template_submission_solution_files(zip)
    # Create solution directory with template file
    zip.put_next_entry 'solution/'
    zip.put_next_entry 'solution/template.py'
    zip.print @test_params[:solution]
    zip.print "\n"

    # Create submission directory with template file
    zip.put_next_entry 'submission/'
    zip.put_next_entry 'submission/template.py'
    zip.print @test_params[:submission]
    zip.print "\n"
  end

  # Retrieves the absolute path of the file specified
  #
  # @param [String] filename The filename of the file to get the path of
  def get_file_path(filename)
    File.join(__dir__, filename).freeze
  end

  def zip_test_files(test_type, zip)
    # Print test class preamble
    test_class_name = "#{test_type}_tests_grader".camelize
    class_definition = <<~PYTHON
      class #{test_class_name}(unittest.TestCase):
          def setUp(self):
              # clears the dictionary containing metadata for each test
              self.meta = { 'expression': '', 'expected': '', 'hint': '' }
    PYTHON

    zip.print class_definition

    tests = @test_params[:test_cases]
    tests[test_type]&.each&.with_index(1) do |test, index|
      # String types should be displayed with quotes, other types will be converted to string
      # with the str method.
      expected = string?(test[:expected]) ? test[:expected].inspect : "str(#{test[:expected]})"
      hint = test[:hint].blank? ? String(nil) : "self.meta['hint'] = #{test[:hint].inspect}"

      test_fn = <<-PYTHON
    def test_#{test_type}_#{format('%<index>02i', index: index)}(self):
        self.meta['expression'] = #{test[:expression].inspect}
        self.meta['expected'] = #{expected}
        #{hint}
        _out = #{test[:expression]}
        self.meta['output'] = "'" + _out + "'" if isinstance(_out, str) else _out
        self.assertEqual(_out, #{test[:expected]})
      PYTHON

      zip.print test_fn
    end
    zip.print "\n"
  end

  def generate_meta(data_files_to_keep, submission_files_to_keep, solution_files_to_keep)
    meta = default_meta

    [:submission, :solution, :prepend, :append].each { |field| meta[field] = @test_params[field] }

    meta[:data_files] = files_meta('data_files', data_files_to_keep)
    add_file_submission_meta(meta, submission_files_to_keep, solution_files_to_keep)

    [:public, :private, :evaluation].each do |test_type|
      meta[:test_cases][test_type] = @test_params[:test_cases][test_type] || []
    end

    meta.as_json
  end

  # Defines the default meta to be used by the online editor for rendering.
  #
  # @return [Hash]
  def default_meta
    super.merge(submit_as_file: false, submission_files: [], solution_files: [])
  end

  # Permits the fields that are used to generate a the package for the language.
  #
  # @param [ActionController::Parameters] params The parameters containing the data for package
  #   generation.
  def test_params(params)
    test_params = params.require(:question_programming).permit(
      :prepend, :append, :solution, :submission, :autograded, :submit_as_file,
      submission_files: [],
      solution_files: [],
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
    super.tap do |whitelisted|
      next unless whitelisted[:submit_as_file] == 'true'

      whitelisted[:submission_files_to_delete] = params['question_programming']['submission_files_to_delete']
      whitelisted[:solution_files_to_delete] = params['question_programming']['solution_files_to_delete']
    end
  end
end
