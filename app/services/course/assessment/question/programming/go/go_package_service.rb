# frozen_string_literal: true
class Course::Assessment::Question::Programming::Go::GoPackageService <
  Course::Assessment::Question::Programming::LanguagePackageService
  def submission_templates
    [
      {
        filename: 'template.go',
        content: @test_params[:submission] || ''
      }
    ]
  end

  def generate_package(old_attachment)
    return nil if @test_params.blank?

    @tmp_dir = Dir.mktmpdir
    @old_meta = old_attachment.present? ? extract_meta(old_attachment, nil) : nil
    data_files = package_files('data_files', old_attachment)
    @meta = generate_meta(data_files)

    return nil if package_unchanged?

    @attachment = generate_zip_file(data_files)
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

    # For python editor, there is only a single submission template file.
    meta[:submission] = template_files.first.content

    meta.as_json
  end

  # rubocop:disable-next Metrics/MethodLength
  def generate_zip_file(data_files)
    tmp = Tempfile.new(['package', '.zip'])
    makefile_path = get_file_path('go_makefile')

    Zip::OutputStream.open(tmp.path) do |zip|
      # Create solution directory with template file
      zip.put_next_entry 'solution/'
      zip.put_next_entry 'solution/template.go'
      zip.print @test_params[:solution]
      zip.print "\n"

      # Create submission directory with template file
      zip.put_next_entry 'submission/'
      zip.put_next_entry 'submission/template.go'
      zip.print @test_params[:submission]
      zip.print "\n"

      # Create tests directory with prepend, append and autograde files
      zip.put_next_entry 'tests/'
      zip.put_next_entry 'tests/append.go'
      zip.print "\n"
      zip.print @test_params[:append]
      zip.print "\n"

      zip.put_next_entry 'tests/prepend.go'
      zip.print @test_params[:prepend]
      zip.print "\n"

      [:public, :private, :evaluation].each do |test_type|
        zip_test_files(test_type, zip)
      end

      # Creates Makefile
      zip.put_next_entry 'Makefile'
      zip.print File.read(makefile_path)

      zip.put_next_entry '.meta'
      zip.print @meta.to_json
    end

    Zip::File.open(tmp.path) do |zip|
      add_data_files(zip, data_files)
    end

    tmp
  end

  # Retrieves the absolute path of the file specified
  #
  # @param [String] filename The filename of the file to get the path of
  def get_file_path(filename)
    File.join(__dir__, filename).freeze
  end

  def zip_test_files(test_type, zip)
    # Create a dummy report to pass test cases to DB/Codaveri
    tests = @test_params[:test_cases]
    return unless tests[test_type]&.count&.> 0

    zip.put_next_entry "report-#{test_type}.xml"
    zip.print build_dummy_report(test_type, tests[test_type])
  end

  def build_dummy_report(test_type, test_cases)
    Course::Assessment::ProgrammingTestCaseReportBuilder.build_dummy_report(test_type, test_cases, '.go')
  end

  def generate_meta(data_files)
    meta = default_meta

    [:submission, :solution, :prepend, :append].each { |field| meta[field] = @test_params[field] }

    meta[:data_files] = files_meta(data_files)

    [:public, :private, :evaluation].each do |test_type|
      meta[:test_cases][test_type] = @test_params[:test_cases][test_type] || []
    end

    meta.as_json
  end
end
