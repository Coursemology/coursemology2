# frozen_string_literal: true
class Course::Assessment::Question::Programming::Java::JavaPackageService <
  Course::Assessment::Question::Programming::LanguagePackageService
  # The autograding definitions appended to `tests/prepend` of every generated Java package.
  # The Codaveri Java package service strips them back out, and relies on this path to know how
  # long they are, so keep it the single source of truth.
  AUTOGRADE_PRE_PATH = File.join(File.expand_path(__dir__), 'java_autograde_pre.java').freeze

  def initialize(params)
    @test_params = test_params params if params.present?
    super
  end

  def submission_templates
    return uploaded_submission_templates if submit_as_file?

    [
      filename: 'template',
      content: @test_params[:submission] || ''
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

  def extract_autograded_meta(attachment)
    attachment.open(binmode: true) do |temporary_file|
      package = Course::Assessment::ProgrammingPackage.new(temporary_file)
      meta = package.meta_file
      @old_meta = meta.present? ? JSON.parse(meta) : nil
    ensure
      next unless package

      temporary_file.close
    end
  end

  def generate_non_autograded_meta(template_files)
    meta = default_meta

    return meta if template_files.blank?

    # TODO: Refactor to support multiple files in non-autograded mode
    meta[:submission] = template_files.first&.content

    meta.as_json
  end

  def generate_zip_file(data_files_to_keep, submission_files_to_keep, solution_files_to_keep)
    tmp = Tempfile.new(['package', '.zip'])
    autograde_build_path = File.join(File.expand_path(__dir__), 'java_build.xml').freeze
    autograde_run_path = File.join(File.expand_path(__dir__), 'RunTests.java').freeze
    makefile_path = File.join(File.expand_path(__dir__), 'java_simple_makefile').freeze
    standard_makefile_path = File.join(File.expand_path(__dir__), 'java_standard_makefile').freeze

    Zip::OutputStream.open(tmp.path) do |zip|
      if submit_as_file?
        # Creates Makefile for standard java files (submitted as whole file)
        zip.put_next_entry 'Makefile'
        zip.print File.read(standard_makefile_path)
      else
        generate_simple_submission_solution_files(zip)

        # Creates Makefile for simple java files (submitted as template)
        zip.put_next_entry 'Makefile'
        zip.print File.read(makefile_path)
      end

      # Create JavaTest class file which is used to run the tests files
      zip.put_next_entry 'tests/'
      zip.put_next_entry 'tests/RunTests.java'
      zip.print File.read(autograde_run_path)

      # Create Autograder test file containing all the test functions
      zip.put_next_entry 'tests/prepend'
      zip.print @test_params[:prepend]
      zip.print "\n"
      zip.print File.read(AUTOGRADE_PRE_PATH)
      zip.print "\n"

      zip.put_next_entry 'tests/append'
      zip.print @test_params[:append]
      zip.print "\n"

      zip.put_next_entry 'tests/autograde'
      [:public, :private, :evaluation].each do |test_type|
        zip_test_files(test_type, zip)
      end
      # To close up the Autograder class
      zip.print '}'

      # Creates ant build file
      zip.put_next_entry 'build.xml'
      zip.print File.read(autograde_build_path)

      zip.put_next_entry '.meta'
      zip.print @meta.to_json
    end

    Zip::File.open(tmp.path) do |zip|
      add_submission_and_solution_files(zip, submission_files_to_keep, solution_files_to_keep) if submit_as_file?
      add_data_files(zip, data_files_to_keep)
    end

    tmp
  end

  # Used to generate submission and solution template files for simple java implementation
  # (Submitted as template files)
  def generate_simple_submission_solution_files(zip)
    # Create solution directory and create solution files
    zip.put_next_entry 'solution/'
    zip.put_next_entry 'solution/template'
    zip.print @test_params[:solution]

    # # Create submission directory with template file
    zip.put_next_entry 'submission/'
    zip.put_next_entry 'submission/template'
    zip.print @test_params[:submission]
    zip.print "\n"
  end

  def zip_test_files(test_type, zip)
    tests = @test_params[:test_cases]
    tests[test_type]&.each&.with_index(1) do |test, index|
      hint = test[:hint].blank? ? String(nil) : "result.setAttribute(\"hint\", #{test[:hint].inspect});"

      test_fn = <<-JAVA
        @Test(groups = { "#{test_type}" })
        public void test_#{test_type}_#{format('%<index>02i', index: index)}() {
          ITestResult result = Reporter.getCurrentTestResult();
          result.setAttribute("expression", #{test[:expression].inspect});
          #{test[:inline_code]}
          result.setAttribute("expected", printValue(#{test[:expected]}));
          result.setAttribute("output", printValue(#{test[:expression]}));
          #{hint}
          expectEquals(#{test[:expression]}, #{test[:expected]});
        }
      JAVA

      zip.print test_fn
    end
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
    {
      submission: '',
      solution: '',
      submit_as_file: false,
      submission_files: [],
      solution_files: [],
      prepend: '',
      append: '',
      data_files: [],
      test_cases: {
        public: [],
        private: [],
        evaluation: []
      }
    }
  end

  # Permits the fields that are used to generate a the package for the language.
  #
  # @param [ActionController::Parameters] params The parameters containing the data for package
  #   generation.
  def test_params(params)
    test_params = params.require(:question_programming).permit(
      :prepend, :append, :autograded, :solution, :submission, :submit_as_file,
      submission_files: [],
      solution_files: [],
      data_files: [],
      test_cases: {
        public: [:expression, :expected, :hint, :inline_code],
        private: [:expression, :expected, :hint, :inline_code],
        evaluation: [:expression, :expected, :hint, :inline_code]
      }
    )

    whitelist(params, test_params)
  end

  def whitelist(params, test_params)
    test_params.tap do |whitelisted|
      whitelisted[:data_files_to_delete] = params['question_programming']['data_files_to_delete']
      whitelisted[:submission_files_to_delete] = params['question_programming']['submission_files_to_delete']
      whitelisted[:solution_files_to_delete] = params['question_programming']['solution_files_to_delete']
    end
  end
end
