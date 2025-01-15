# frozen_string_literal: true
# rubocop:disable Metrics/abcSize
class Course::Assessment::Question::ProgrammingCodaveri::Java::JavaPackageService <
  Course::Assessment::Question::ProgrammingCodaveri::LanguagePackageService
  include Course::Assessment::Question::CodaveriQuestionConcern

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

  def process_evaluator
    extract_evaluator
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
    pattern_test = /@Test\(groups\s*=\s*\{\s*"(?:public|private|evaluation)"\s*\}\)\s*public\s+void\s+(\w+)\s*\(\)\s*\{([\s\S]*?expectEquals\((.*)\);[\s\S]*?)\}/ # rubocop:disable Layout/LineLength

    reg_test = Regexp.new(pattern_test)
    test_cases_regex = autograde_content.scan(reg_test)

    test_cases_with_id = preload_question_test_cases

    test_cases_regex.each do |test_case|
      test_case_object = default_codaveri_expr_test_case_template
      test_case_name, prefix, expression = test_case

      first_comma_index = find_unenclosed_comma_index(expression)
      lhs_expression = expression[..first_comma_index - 1].strip
      rhs_expression = expression[first_comma_index + 1..].strip

      cleaned_prefix = prefix.lines.reject do |line|
        line.include?('ITestResult') || line.include?('setAttribute') ||
          line.include?('expectEquals') || line.include?('printValue')
      end.join

      test_case_object[:index] = test_cases_with_id[test_case_name]
      test_case_object[:timeout] = @question.time_limit * 1000 if @question.time_limit
      test_case_object[:prefix] = cleaned_prefix
      # Objects.deepEquals will lead to stackoverflow error if object contains self-references
      # TODO: handle self-references case
      test_case_object[:lhsExpression] = "Objects.deepEquals(#{lhs_expression}, #{rhs_expression})"
      test_case_object[:rhsExpression] = 'true'
      test_case_object[:display] = "printValue(#{lhs_expression})"

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
    supporting_file_object = default_codaveri_data_file_template

    supporting_file_object[:type] = 'internal' # 'external' s3 upload not yet implemented by codaveri
    supporting_file_object[:path] = filename.to_s
    # TODO: re-implement content.force_encoding('UTF-8').valid_encoding? check
    # Pending Codaveri 'utf8' encoding support for compiled languages
    supporting_file_object[:content] = Base64.strict_encode64(content)
    supporting_file_object[:encoding] = 'base64'

    @data_files.append(supporting_file_object)
  end

  def extract_template
    submission_files = @package.submission_files

    submission_files.each_key do |pathname|
      main_template_object = default_codaveri_template_template

      main_template_object[:path] =
        (!@question.multiple_file_submission && extract_pathname_from_java_file(submission_files[pathname])) ||
        pathname.to_s
      main_template_object[:content] = submission_files[pathname]
      main_template_object[:prefix] = ''
      main_template_object[:suffix] = ''

      @template_files.append(main_template_object)
    end
  end

  def extract_evaluator
    test_files = @package.test_files
    @evaluator_config[:prefix] =
      "#{strip_autograding_definition_from(test_files[Pathname.new('prepend')])}\nimport java.util.Objects;"
    @evaluator_config[:suffix] =
      "#{extract_print_functions_from(test_files[Pathname.new('prepend')])}\n\n#{test_files[Pathname.new('append')]}"
  end

  def preload_question_test_cases
    # The regex below finds all text after the last slash
    # (eg AutoGrader/AutoGrader/test_private_4 -> test_private_4)
    @question.test_cases.pluck(:identifier, :id).to_h { |x| [x[0].match(/[^\/]+$/).to_s, x[1]] }
  end

  def extract_print_functions_from(prepend_file_content)
    autograding_definition = prepend_file_content[-6256..]

    autograding_lines = autograding_definition.lines[-44..-5].join

    autograding_lines.gsub(/\bString printValue\b/, 'static String printValue')
  end

  def strip_autograding_definition_from(file_content)
    # we strip away all the definitions inside the Autograder class defined within prepend,
    # which has 6256 characters. Those definitions are defined within our java_autograded_pre.java
    # and not needed to be sent to Codaveri

    file_content[..-6256]
  end

  def find_unenclosed_comma_index(input)
    stack = []

    input.chars.each_with_index do |char, index|
      next if index > 0 && input[index - 1] == '\\'

      case char
      when '(', '{', '['
        stack.push(char) unless stack.last == '"' || stack.last == "'"
      when ')'
        stack.pop if stack.last == '('
      when '}'
        stack.pop if stack.last == '{'
      when ']'
        stack.pop if stack.last == '['
      when '"', "'"
        if stack.last == char
          stack.pop
        else
          stack.push(char) unless stack.last == '"' || stack.last == "'"
        end
      when ','
        return index if stack.empty?
      end
    end

    input.length
  end
end
# rubocop:enable Metrics/abcSize
