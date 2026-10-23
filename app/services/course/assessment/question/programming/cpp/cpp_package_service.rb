# frozen_string_literal: true
class Course::Assessment::Question::Programming::Cpp::CppPackageService <
  Course::Assessment::Question::Programming::LanguagePackageService
  def submission_templates
    [
      {
        filename: 'template.c',
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

    # For cpp editor, there is only a single submission template file.
    meta[:submission] = template_files.first.content

    meta.as_json
  end

  def generate_zip_file(data_files)
    tmp = Tempfile.new(['package', '.zip'])
    autograde_include_path = get_file_path('cpp_autograde_include.cc')
    autograde_pre_path = get_file_path('cpp_autograde_pre.cc')
    autograde_post_path = get_file_path('cpp_autograde_post.cc')
    makefile_path = get_file_path('cpp_makefile')

    Zip::OutputStream.open(tmp.path) do |zip|
      # Create solution directory with template file
      zip.put_next_entry 'solution/'
      zip.put_next_entry 'solution/template.c'
      zip.print @test_params[:solution]
      zip.print "\n"

      # Create submission directory with template file
      zip.put_next_entry 'submission/'
      zip.put_next_entry 'submission/template.c'
      zip.print @test_params[:submission]
      zip.print "\n"

      # Create tests directory with prepend, append and autograde files
      zip.put_next_entry 'tests/'
      zip.put_next_entry 'tests/append.cc'
      zip.print "\n"
      zip.print @test_params[:append]
      zip.print "\n"

      zip.put_next_entry 'tests/prepend.cc'
      zip.print "\n"
      zip.print File.read(autograde_include_path)
      zip.print "\n"
      zip.print @test_params[:prepend]
      zip.print "\n"
      zip.print File.read(autograde_pre_path)
      zip.print "\n"

      zip.put_next_entry 'tests/autograde.cc'

      [:public, :private, :evaluation].each do |test_type|
        zip_test_files(test_type, zip)
      end

      zip.print "\n"
      zip.print File.read(autograde_post_path)

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
    tests = @test_params[:test_cases]
    tests[test_type]&.each&.with_index(1) do |test, index|
      hint = test[:hint].blank? ? String(nil) : "RecordProperty(\"hint\", #{test[:hint].inspect})"

      test_fn = <<-CPP
        TEST(Autograder, test_#{test_type}_#{format('%<index>02i', index: index)}) {
          RecordProperty("expression", #{test[:expression].inspect});
          custom_evaluation(#{test[:expected]}, #{test[:expression]});
          #{hint};
        }
      CPP

      zip.print test_fn
    end
  end

  # Get the hash of the files we add to the programming package, so that
  # any changes made to those files would trigger a rebuild so package recompiles correctly.
  def package_file_entry(package_file_path)
    {
      path: package_file_path,
      hash: Digest::SHA256.file(get_file_path(package_file_path)).hexdigest
    }
  end

  def package_files_meta
    @package_files_meta ||= [
      package_file_entry('cpp_autograde_include.cc'),
      package_file_entry('cpp_autograde_pre.cc'),
      package_file_entry('cpp_autograde_post.cc'),
      package_file_entry('cpp_makefile')
    ]
  end

  def generate_meta(data_files)
    meta = default_meta

    [:submission, :solution, :prepend, :append].each { |field| meta[field] = @test_params[field] }

    meta[:data_files] = files_meta(data_files)

    [:public, :private, :evaluation].each do |test_type|
      meta[:test_cases][test_type] = @test_params[:test_cases][test_type] || []
    end

    meta[:package_files] = package_files_meta

    meta.as_json
  end
end
