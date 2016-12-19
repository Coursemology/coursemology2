# frozen_string_literal: true
module Course::Assessment::Question::Programming::Python::PackageConcern
  AUTOGRADE_PRE_PATH = File.join(File.expand_path(File.dirname(__FILE__)), 'python_autograde_pre.py').freeze

  AUTOGRADE_POST_PATH = File.join(File.expand_path(File.dirname(__FILE__)), 'python_autograde_post.py').freeze

  MAKEFILE_PATH = File.join(File.expand_path(File.dirname(__FILE__)), 'python_makefile').freeze

  def python_package(old_attachment, params)
    test_params = python_test_params params

    return nil if test_params.blank? || (old_attachment.present? && test_params == python_meta(old_attachment))

    generate_zip_file(test_params)
  end

  def python_meta(attachment)
    attachment.open(binmode: true) do |temporary_file|
      begin
        package = Course::Assessment::ProgrammingPackage.new(temporary_file)
        meta = package.meta_file
        JSON.parse(meta) if meta.present?
      rescue
        nil
      ensure
        next unless package
        temporary_file.close
      end
    end
  end

  private

  def generate_zip_file(params)
    tmp = Tempfile.new(['package', '.zip'])

    Zip::OutputStream.open(tmp.path) do |zip|
      # Create solution directory with template file
      zip.put_next_entry 'solution/'
      zip.put_next_entry 'solution/template.py'
      zip.print params[:solution]
      zip.print "\n"

      # Create submission directory with template file
      zip.put_next_entry 'submission/'
      zip.put_next_entry 'submission/template.py'
      zip.print params[:submission]
      zip.print "\n"

      # Create tests directory with prepend, append and autograde files
      zip.put_next_entry 'tests/'
      zip.put_next_entry 'tests/append.py'
      zip.print params[:append]
      zip.print "\n"

      zip.put_next_entry 'tests/prepend.py'
      zip.print params[:prepend]
      zip.print "\n"

      zip.put_next_entry 'tests/autograde.py'
      zip.print File.read(AUTOGRADE_PRE_PATH)

      tests = params[:test_cases]

      if tests.blank?
        zip.print "    def test_public_1(self):\n"\
                    "        self.meta['expression'] = 'This testcase has no meaning.'\n"\
                    "        self.meta['expected'] = 'Just finalise your answer when you are done'\n"\
                    "        self.assertEqual(True, True)\n"\
                    "\n"
      else
        index = 1
        [:public, :private, :evaluation].each do |test_type|
          tests[test_type].try(:each) do |test|
            escaped_expression = test[:expression].gsub("\\", "\\\\\\").gsub("'", "\\\\'")

            test_fn = "    def test_#{test_type.to_s}_#{index}(self):\n"\
                      "        self.meta['expression'] = '#{escaped_expression}'\n"\

            if test[:expected].first == '\'' && test[:expected].last == '\'' ||
              test[:expected].first == '"' && test[:expected].last == '"'
              escaped_expected = test[:expected].gsub("\\", "\\\\\\").gsub("'", "\\\\'")
              test_fn += "        self.meta['expected'] = '#{escaped_expected}'\n"
            else
              test_fn += "        self.meta['expected'] = str(#{test[:expected]})\n"
            end

            test_fn += "        self.meta['hint'] = '#{test[:hint]}'\n" unless test[:hint].blank?
            test_fn += "        _out = #{test[:expression]}\n"\
                       "        self.meta['output'] = _out\n"\
                       "        self.assertEqual(_out, #{test[:expected]})\n"\
                       "\n"

            zip.print test_fn

            index += 1
          end
        end
      end

      zip.print File.read(AUTOGRADE_POST_PATH)

      # Creates Makefile
      zip.put_next_entry 'Makefile'
      zip.print File.read(MAKEFILE_PATH)

      zip.put_next_entry '.meta'
      zip.print generate_meta(params)
    end

    tmp
  end

  def generate_meta(params)
    params.to_json
  end

  def python_test_params(params)
    params.require(:question_programming).permit(
      :prepend, :append, :solution, :submission,
      test_cases: {
        public: [:expression, :expected, :hint],
        private: [:expression, :expected, :hint],
        evaluation: [:expression, :expected, :hint]
      }
    )
  end
end
