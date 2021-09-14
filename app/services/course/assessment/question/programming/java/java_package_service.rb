# frozen_string_literal: true
class Course::Assessment::Question::Programming::Java::JavaPackageService < \
  Course::Assessment::Question::Programming::LanguagePackageService
  def initialize(params)
    @test_params = test_params params if params.present?
    super
  end

  def submission_templates
    if submit_as_file?
      templates = []
      @test_params[:submission_files].map do |file|
        template_file = { filename: file.original_filename, content: File.read(file.tempfile.path) }
        templates.push(template_file)
      end

      templates
    else
      [
        filename: 'template',
        content: @test_params[:submission] || ''
      ]
    end
  end

  def generate_package(old_attachment)
    return nil if @test_params.blank?

    @tmp_dir = Dir.mktmpdir
    @old_meta = old_attachment.present? ? extract_meta(old_attachment, nil) : nil
    data_files_to_keep = old_attachment.present? ? find_files_to_keep('data_files', old_attachment) : []
    submission_files_to_keep = old_attachment.present? ? find_files_to_keep('submission_files', old_attachment) : []
    solution_files_to_keep = old_attachment.present? ? find_files_to_keep('solution_files', old_attachment) : []
    @meta = generate_meta(data_files_to_keep, submission_files_to_keep, solution_files_to_keep)

    return nil if @meta == @old_meta

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

  def extract_from_package(package, file_type, new_filenames, files_to_delete)
    files_to_keep = []

    if @old_meta.present?
      package.unzip_file @tmp_dir
      @old_meta[file_type].try(:each) do |file|
        next if files_to_delete.try(:include?, (file['filename']))
        # new files overrides old ones
        next if new_filenames.include?(file['filename'])

        files_to_keep.append(File.new(File.join(resolve_folder_path(@tmp_dir, file_type), file['filename'])))
      end
    end

    files_to_keep
  end

  def resolve_folder_path(tmp_dir, file_type)
    case file_type
    when 'submission_files'
      "#{tmp_dir}/submission"
    when 'solution_files'
      "#{tmp_dir}/solution"
    # Data files do not need resolution
    else
      tmp_dir
    end
  end

  def find_files_to_keep(file_type, attachment)
    new_filenames = (@test_params[file_type] || []).reject(&:nil?).map(&:original_filename)

    attachment.open(binmode: true) do |temporary_file|
      package = Course::Assessment::ProgrammingPackage.new(temporary_file)
      files_to_delete = "#{file_type}_to_delete"
      return extract_from_package(package, file_type, new_filenames, @test_params[files_to_delete])
    ensure
      next unless package

      temporary_file.close
    end
  end

  def generate_zip_file(data_files_to_keep, submission_files_to_keep, solution_files_to_keep)
    tmp = Tempfile.new(['package', '.zip'])
    autograde_build_path = File.join(File.expand_path(__dir__), 'java_build.xml').freeze
    autograde_pre_path = File.join(File.expand_path(__dir__), 'java_autograde_pre.java').freeze
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
      zip.print File.read(autograde_pre_path)
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
      # @test_params should have the [:submission_files] key if submitted as a file
      if submit_as_file?
        generate_standard_submission_solution_files(zip, submission_files_to_keep, solution_files_to_keep)
      end

      @test_params[:data_files].try(:each) do |file|
        next if file.nil?

        zip.add(file.original_filename, file.tempfile.path)
      end

      data_files_to_keep.each do |file|
        zip.add(File.basename(file.path), file.path)
      end
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

  # Used to generate submission and solution files for the regular java implementation
  # (Submitted as whole files)
  def generate_standard_submission_solution_files(zip, submission_files_to_keep, solution_files_to_keep)
    zip.mkdir('submission')
    @test_params[:submission_files].try(:each) do |file|
      next if file.nil?

      zip.add("submission/#{file.original_filename}", file.tempfile.path)
    end

    submission_files_to_keep.each do |file|
      zip.add("submission/#{File.basename(file.path)}", file.path)
    end

    zip.mkdir('solution')
    @test_params[:solution_files].try(:each) do |file|
      next if file.nil?

      zip.add("solution/#{file.original_filename}", file.tempfile.path)
    end

    solution_files_to_keep.each do |file|
      zip.add("solution/#{File.basename(file.path)}", file.path)
    end
  end

  def zip_test_files(test_type, zip) # rubocop:disable Metrics/AbcSize
    tests = @test_params[:test_cases]
    tests[test_type]&.each&.with_index(1) do |test, index|
      # String types should be displayed with quotes, other types will be converted to string
      # with the str method.
      expected = string?(test[:expected]) ? test[:expected].inspect : (test[:expected]).to_s
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

  def get_files_meta(files_to_keep, new_files)
    files = []

    new_files.each do |file|
      sha256 = Digest::SHA256.file(file.tempfile).hexdigest
      files.append(filename: file.original_filename, size: file.tempfile.size, hash: sha256)
    end

    files_to_keep.each do |file|
      sha256 = Digest::SHA256.file(file).hexdigest
      files.append(filename: File.basename(file.path), size: file.size, hash: sha256)
    end

    files.sort_by { |file| file[:filename].downcase }
  end

  def generate_meta(data_files_to_keep, submission_files_to_keep, solution_files_to_keep)
    meta = default_meta

    [:submission, :solution, :prepend, :append].each { |field| meta[field] = @test_params[field] }

    new_data_files = (@test_params[:data_files] || []).reject(&:nil?)
    meta[:data_files] = get_files_meta(data_files_to_keep, new_data_files)

    meta[:submit_as_file] = submit_as_file?

    new_submission_files = (@test_params[:submission_files] || []).reject(&:nil?)
    meta[:submission_files] = get_files_meta(submission_files_to_keep, new_submission_files)

    new_solution_files = (@test_params[:solution_files] || []).reject(&:nil?)
    meta[:solution_files] = get_files_meta(solution_files_to_keep, new_solution_files)

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

  def submit_as_file?
    @test_params[:submit_as_file] == 'true'
  end
end
