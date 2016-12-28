# frozen_string_literal: true
class Course::Assessment::Question::Programming::Python::PythonPackageService
  AUTOGRADE_PRE_PATH = File.join(File.expand_path(File.dirname(__FILE__)),
                                 'python_autograde_pre.py').freeze

  AUTOGRADE_POST_PATH = File.join(File.expand_path(File.dirname(__FILE__)),
                                  'python_autograde_post.py').freeze

  MAKEFILE_PATH = File.join(File.expand_path(File.dirname(__FILE__)), 'python_makefile').freeze

  def generate_package(old_attachment, params)
    test_params = python_test_params params

    if test_params.blank? ||
       (old_attachment.present? && test_params == extract_meta(old_attachment))
      return nil
    end

    generate_zip_file(test_params)
  end

  def extract_meta(attachment)
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
        expression = I18n.t('course.assessment.question.programming.package.default_expression')
        expected = I18n.t('course.assessment.question.programming.package.default_expected')

        zip.print "    def test_public_1(self):\n"\
                  "        self.meta['expression'] = #{expression.inspect}\n"\
                  "        self.meta['expected'] = #{expected.inspect}\n"\
                  "        self.assertEqual(True, True)\n"\
                  "\n"
      else
        index = 1
        [:public, :private, :evaluation].each do |test_type|
          tests[test_type].try(:each) do |test|
            test_fn = "    def test_#{test_type}_#{index}(self):\n"\
                      "        self.meta['expression'] = #{test[:expression].inspect}\n"\

            # String types should be displayed with quotes, other types will be converted to string
            # with the str method.
            expected = string?(test[:expected]) ? test[:expected].inspect : "str(#{test[:expected]}"
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

  def string?(expected)
    expected.first == '\'' && expected.last == '\'' ||
      expected.first == '"' && expected.last == '"'
  end
end
