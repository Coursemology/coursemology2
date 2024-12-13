# frozen_string_literal: true
# rubocop:disable Metrics/abcSize
class Course::Assessment::Question::ProgrammingCodaveri::Java::JavaPackageService <
  Course::Assessment::Question::ProgrammingCodaveri::LanguagePackageService
  def process_solutions
    extract_main_solution
  end

  def process_test_cases
    extract_test_cases
  end

  def process_data
    extract_supporting_files
  end

  def process_templates
    extract_template
  end

  private

  def extract_main_solution
    solution_files = @package.solution_files

    @package.solution_files.each_key do |pathname|
      main_solution_object = default_codaveri_solution_template

      main_solution_object[:path] = pathname.to_s
      main_solution_object[:content] = solution_files[pathname]

      next if main_solution_object[:content].blank?

      @solution_files.append(main_solution_object)
    end
  end

  def extract_test_cases
    autograde_content = @package.test_files[Pathname.new('autograde')]
    pattern_test = /@Test\(groups\s*=\s*\{\s*"(?:public|private|evaluation)"\s*\}\)\s*public\s+void\s+(\w+)\s*\(\)\s*\{([\s\S]*?expectEquals\(\s*([\[{("'][^\]]*[\])"'}]|[^,]+)\s*,\s*(.*?)\s*\);[\s\S]*?)\}/ # rubocop:disable Layout/LineLength

    reg_test = Regexp.new(pattern_test)
    test_cases_regex = autograde_content.scan(reg_test)

    test_cases_with_id = preload_question_test_cases

    test_cases_regex.each do |test_case|
      test_case_object = default_codaveri_expr_test_case_template
      test_case_name, prefix, expression, expected = test_case

      cleaned_prefix = prefix.lines.reject do |line|
        line.include?('ITestResult') || line.include?('setAttribute') ||
          line.include?('expectEquals') || line.include?('printValue')
      end.join

      test_case_object[:index] = test_cases_with_id[test_case_name]
      test_case_object[:timeout] = @question.time_limit * 1000 if @question.time_limit
      test_case_object[:prefix] = cleaned_prefix
      test_case_object[:lhsExpression] = expression
      test_case_object[:rhsExpression] = expected
      test_case_object[:display] = expression

      @test_case_files.append(test_case_object)
    end
  end

  def extract_supporting_files
    extract_supporting_main_files
    extract_supporting_tests_files
  end

  def extract_supporting_main_files
    main_files = @package.main_files.compact.to_h
    main_filenames = main_files.keys

    main_filenames.each do |filename|
      next if ['Makefile', 'build.xml', '.meta'].include?(filename.to_s)

      extract_supporting_file(filename, main_files[filename])
    end
  end

  def extract_supporting_tests_files
    test_files = @package.test_files
    test_filenames = test_files.keys

    test_filenames.each do |filename|
      next if ['append', 'prepend', 'autograde', 'RunTests.java'].include?(filename.to_s)

      extract_supporting_file(filename, test_files[filename])
    end
  end

  def extract_supporting_file(filename, content)
    supporting_solution_object = default_codaveri_data_file_template

    supporting_solution_object[:type] = 'internal'
    supporting_solution_object[:path] = filename.to_s
    supporting_solution_object[:content] = content

    @data_files.append(supporting_solution_object)
  end

  def extract_template
    submission_files = @package.submission_files
    test_files = @package.test_files

    submission_files.each_key do |pathname|
      main_template_object = default_codaveri_template_template

      main_template_object[:path] = pathname.to_s
      main_template_object[:content] = submission_files[pathname]
      main_template_object[:prefix] = test_files[Pathname.new('prepend')]
      main_template_object[:suffix] = test_files[Pathname.new('append')]

      @template_files.append(main_template_object)
    end
  end

  def preload_question_test_cases
    # The regex below finds all text after the last slash
    # (eg AutoGrader/AutoGrader/test_private_4 -> test_private_4)
    @question.test_cases.pluck(:identifier, :id).to_h { |x| [x[0].match(/[^\/]+$/).to_s, x[1]] }
  end
end
# rubocop:enable Metrics/abcSize
