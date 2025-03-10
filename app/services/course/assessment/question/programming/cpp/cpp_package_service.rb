# frozen_string_literal: true
class Course::Assessment::Question::Programming::Cpp::CppPackageService < \
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
    data_files_to_keep = old_attachment.present? ? find_data_files_to_keep(old_attachment) : []
    @meta = generate_meta(data_files_to_keep)

    return nil if @meta == @old_meta

    @attachment = generate_zip_file(data_files_to_keep)
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

  def extract_from_package(package, new_data_filenames, data_files_to_delete)
    data_files_to_keep = []

    if @old_meta.present?
      package.unzip_file @tmp_dir

      @old_meta['data_files'].try(:each) do |file|
        next if data_files_to_delete.try(:include?, (file['filename']))
        # new files overrides old ones
        next if new_data_filenames.include?(file['filename'])

        data_files_to_keep.append(File.new(File.join(@tmp_dir, file['filename'])))
      end
    end

    data_files_to_keep
  end

  def find_data_files_to_keep(attachment)
    new_filenames = (@test_params[:data_files] || []).reject(&:nil?).map(&:original_filename)

    attachment.open(binmode: true) do |temporary_file|
      package = Course::Assessment::ProgrammingPackage.new(temporary_file)
      return extract_from_package(package, new_filenames, @test_params[:data_files_to_delete])
    ensure
      next unless package

      temporary_file.close
    end
  end

  def generate_zip_file(data_files_to_keep)
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

  # Retrieves the absolute path of the file specified
  #
  # @param [String] filename The filename of the file to get the path of
  def get_file_path(filename)
    File.join(__dir__, filename).freeze
  end

  def zip_test_files(test_type, zip) # rubocop:disable Metrics/AbcSize
    tests = @test_params[:test_cases]
    tests[test_type]&.each&.with_index(1) do |test, index|
      # String types should be displayed with quotes, other types will be converted to string
      # with the str method.
      expected = string?(test[:expected]) ? test[:expected].inspect : (test[:expected]).to_s
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

  def get_data_files_meta(data_files_to_keep, new_data_files)
    data_files = []

    new_data_files.each do |file|
      sha256 = Digest::SHA256.file(file.tempfile).hexdigest
      data_files.append(filename: file.original_filename, size: file.tempfile.size, hash: sha256)
    end

    data_files_to_keep.each do |file|
      sha256 = Digest::SHA256.file(file).hexdigest
      data_files.append(filename: File.basename(file.path), size: file.size, hash: sha256)
    end

    data_files.sort_by { |file| file[:filename].downcase }
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

  def generate_meta(data_files_to_keep)
    meta = default_meta

    [:submission, :solution, :prepend, :append].each { |field| meta[field] = @test_params[field] }

    new_data_files = (@test_params[:data_files] || []).reject(&:nil?)
    meta[:data_files] = get_data_files_meta(data_files_to_keep, new_data_files)

    [:public, :private, :evaluation].each do |test_type|
      meta[:test_cases][test_type] = @test_params[:test_cases][test_type] || []
    end

    meta[:package_files] = package_files_meta

    meta.as_json
  end
end
