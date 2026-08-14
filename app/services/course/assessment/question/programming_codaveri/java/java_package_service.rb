# frozen_string_literal: true
class Course::Assessment::Question::ProgrammingCodaveri::Java::JavaPackageService <
  Course::Assessment::Question::ProgrammingCodaveri::LanguagePackageService
  include Course::Assessment::Question::CodaveriQuestionConcern

  QUOTE_CHARACTERS = ['"', "'"].freeze

  # `tests/prepend` of a generated Java package is the instructor's prepend, a newline, the contents
  # of java_autograde_pre.java, and a trailing newline -- see
  # Course::Assessment::Question::Programming::Java::JavaPackageService#generate_zip_file. Those
  # autograding definitions are ours rather than the instructor's, so they are stripped back out
  # before the evaluator config is sent to Codaveri. Measured from the file itself so that editing
  # java_autograde_pre.java cannot silently desynchronise this.
  AUTOGRADE_DEFINITION_LENGTH =
    File.size(Course::Assessment::Question::Programming::Java::JavaPackageService::AUTOGRADE_PRE_PATH) + 2

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
      lhs_expression = expression[..(first_comma_index - 1)].strip
      rhs_expression = expression[(first_comma_index + 1)..].strip

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

  # TODO: remove filename.to_s.downcase.end_with?('.java') check
  # For now, only plaintext files that require compiling (e.g. *.java) will use 'utf8' ecoding
  # Pending Codaveri 'utf8' encoding support for all plaintext files in compiled languages
  def utf8_encodable?(filename, utf8_content)
    super && filename.to_s.downcase.end_with?('.java')
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
    autograding_definition = prepend_file_content[-AUTOGRADE_DEFINITION_LENGTH..]

    autograding_lines = autograding_definition.lines[-44..-5].join

    autograding_lines.gsub(/\bString printValue\b/, 'static String printValue')
  end

  def strip_autograding_definition_from(file_content)
    # Drop the trailing autograding definitions, keeping only the instructor's own prepend.
    file_content[..-AUTOGRADE_DEFINITION_LENGTH]
  end

  def find_unenclosed_comma_index(input)
    stack = []

    input.chars.each_with_index do |char, index|
      next if index > 0 && input[index - 1] == '\\'

      case char
      when '(', '{', '['
        stack.push(char) unless QUOTE_CHARACTERS.include?(stack.last)
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
          stack.push(char) unless QUOTE_CHARACTERS.include?(stack.last)
        end
      when ','
        return index if stack.empty?
      end
    end

    input.length
  end
end
