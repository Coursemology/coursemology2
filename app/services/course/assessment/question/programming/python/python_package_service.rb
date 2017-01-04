# frozen_string_literal: true
class Course::Assessment::Question::Programming::Python::PythonPackageService < \
  Course::Assessment::Question::Programming::LanguagePackageService
  AUTOGRADE_PRE_PATH = File.join(File.expand_path(File.dirname(__FILE__)),
                                 'python_autograde_pre.py').freeze

  AUTOGRADE_POST_PATH = File.join(File.expand_path(File.dirname(__FILE__)),
                                  'python_autograde_post.py').freeze

  MAKEFILE_PATH = File.join(File.expand_path(File.dirname(__FILE__)), 'python_makefile').freeze

  def autograded?
    @test_params.key?(:autograded)
  end

  def submission_templates
    [
      {
        filename: 'template.py',
        content: @test_params[:submission]
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

    file = generate_zip_file(data_files_to_keep)
    FileUtils.remove_entry @tmp_dir if @tmp_dir.present?
    file
  end

  def default_meta
    {
      submission: '', solution: '', prepend: '', append: '', autograded: false,
      data_files: [],
      test_cases: {
        public: [],
        private: [],
        evaluation: []
      }
    }
  end

  def extract_meta(attachment, template_files)
    # attachment will be nil if the question is not autograded, in that case the meta data will be
    # generated from the template files in the database.
    return generate_non_autograded_meta(template_files) if attachment.nil?

    extract_autograded_meta(attachment)
  end

  private

  def extract_autograded_meta(attachment)
    attachment.open(binmode: true) do |temporary_file|
      begin
        package = Course::Assessment::ProgrammingPackage.new(temporary_file)
        meta = package.meta_file
        @old_meta = meta.present? ? JSON.parse(meta) : nil
      ensure
        next unless package
        temporary_file.close
      end
    end
  end

  def generate_non_autograded_meta(template_files)
    meta = default_meta

    return meta if template_files.blank?

    # For python editor, there is only a single submission template file.
    meta[:submission] = template_files.first.content

    meta
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
      begin
        package = Course::Assessment::ProgrammingPackage.new(temporary_file)
        return extract_from_package(package, new_filenames, @test_params[:data_files_to_delete])
      ensure
        next unless package
        temporary_file.close
      end
    end
  end

  def generate_zip_file(data_files_to_keep)
    tmp = Tempfile.new(['package', '.zip'])

    Zip::OutputStream.open(tmp.path) do |zip|
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

      # Create tests directory with prepend, append and autograde files
      zip.put_next_entry 'tests/'
      zip.put_next_entry 'tests/append.py'
      zip.print @test_params[:append]
      zip.print "\n"

      zip.put_next_entry 'tests/prepend.py'
      zip.print @test_params[:prepend]
      zip.print "\n"

      zip.put_next_entry 'tests/autograde.py'
      zip.print File.read(AUTOGRADE_PRE_PATH)

      tests = @test_params[:test_cases]

      index = 1
      [:public, :private, :evaluation].each do |test_type|
        tests[test_type].try(:each) do |test|
          test_fn = "    def test_#{test_type}_#{index}(self):\n"\
                    "        self.meta['expression'] = #{test[:expression].inspect}\n"\

          # String types should be displayed with quotes, other types will be converted to string
          # with the str method.
          expected = string?(test[:expected]) ? test[:expected].inspect : "str(#{test[:expected]})"
          test_fn += "        self.meta['expected'] = #{expected}\n"

          unless test[:hint].blank?
            test_fn += "        self.meta['hint'] = #{test[:hint].inspect}\n"
          end

          test_fn += "        _out = #{test[:expression]}\n"\
                     "        self.meta['output'] = _out\n"\
                     "        self.assertEqual(_out, #{test[:expected]})\n"\
                     "\n"

          zip.print test_fn

          index += 1
        end
      end

      zip.print File.read(AUTOGRADE_POST_PATH)

      # Creates Makefile
      zip.put_next_entry 'Makefile'
      zip.print File.read(MAKEFILE_PATH)

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

    data_files
  end

  def generate_meta(data_files_to_keep)
    meta = default_meta

    [:submission, :solution, :prepend, :append].each { |field| meta[field] = @test_params[field] }

    meta[:autograded] = autograded?

    new_data_files = (@test_params[:data_files] || []).reject(&:nil?)
    meta[:data_files] = get_data_files_meta(data_files_to_keep, new_data_files)

    [:public, :private, :evaluation].each do |test_type|
      meta[:test_cases][test_type] = @test_params[:test_cases][test_type] || []
    end

    meta
  end

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
end
