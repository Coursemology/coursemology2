# frozen_string_literal: true
# rubocop:disable Metrics/abcSize
class Course::Assessment::Question::ProgrammingCodaveri::Python::PythonPackageService < \
  Course::Assessment::Question::ProgrammingCodaveri::LanguagePackageService
  def process_solutions
    extract_main_solution
    extract_supporting_files
  end

  def process_test_cases
    extract_test_cases
  end

  private

  # Extracts the main solution of a programing question problem and appends it
  # the "files_solution" array for the problem management API request body.
  def extract_main_solution
    main_solution_object = default_codaveri_solution_template

    solution_files = @package.solution_files
    test_files = @package.test_files

    main_solution_object[:path] = 'template.py'
    main_solution_object[:content] = solution_files[Pathname.new('template.py')].gsub('import xmlrunner', '')

    main_solution_object[:prefix] = test_files[Pathname.new('prepend.py')].gsub('import xmlrunner', '')
    main_solution_object[:suffix] = test_files[Pathname.new('append.py')].gsub('import xmlrunner', '')

    @solution_files.append(main_solution_object)
  end

  # In a programming question package, there may be external files that are included in the package
  # The contents of these files are appended to the "files_solution" array in the API Request body.
  def extract_supporting_files
    extract_supporting_main_files
    extract_supporting_tests_files
    extract_supporting_submission_files
    extract_supporting_solution_files
  end

  # Finds and extracts all contents of additional files in the root package folder
  # (excluding the default Makefile and .meta files).
  def extract_supporting_main_files
    main_files = @package.main_files.compact.to_h
    main_filenames = main_files.keys

    main_filenames.each do |filename|
      next if ['Makefile', '.meta'].include?(filename.to_s)

      extract_supporting_file(filename, main_files[filename])
    end
  end

  # Finds and extracts all contents of additional files in the test files folder
  # (excluding the default append.py, prepend.py and autograde.py files).
  def extract_supporting_tests_files
    test_files = @package.test_files
    test_filenames = test_files.keys

    test_filenames.each do |filename|
      next if ['append.py', 'prepend.py', 'autograde.py'].include?(filename.to_s)

      extract_supporting_file(filename, test_files[filename])
    end
  end

  # Finds and extracts all contents of additional files in the submission files folder
  # (excluding the default template.py file).
  def extract_supporting_submission_files
    submission_files = @package.submission_files
    submission_filenames = submission_files.keys

    submission_filenames.each do |filename|
      next if ['template.py'].include?(filename.to_s)

      extract_supporting_file(filename, submission_files[filename])
    end
  end

  # Finds and extracts all contents of additional files in the solution files folder
  # (excluding the default template.py file).
  def extract_supporting_solution_files
    solution_files = @package.solution_files
    solution_filenames = solution_files.keys

    solution_filenames.each do |filename|
      next if ['template.py'].include?(filename.to_s)

      extract_supporting_file(filename, solution_files[filename])
    end
  end

  # Extracts filename and content of a file and append it to the
  # default codaveri files_solution for the problem management API request body.
  #
  # @param [Pathname] pathname The pathname of the file.
  # @param [String] content The content of the file.
  def extract_supporting_file(filename, content)
    supporting_solution_object = default_codaveri_solution_template

    supporting_solution_object[:path] = filename.to_s
    supporting_solution_object[:content] = content

    @solution_files.append(supporting_solution_object)
  end

  # Extracts test cases from 'autograde.py' and append all the test cases to the
  # default codaveri test_cases array for the problem management API request body.
  def extract_test_cases
    autograde_content = @package.test_files[Pathname.new('autograde.py')]
    test_cases_with_id = preload_question_test_cases
    assertion_types = assertion_types_regex

    # Regex to extract test cases
    pattern_test = /def\s(test_(?:public|private|evaluation)_\d+)\(self\):\s*\n(\s+)((?:.|\n)*?)self\.assert(Equal|NotEqual|True|False|Is|IsNot|IsNone|IsNotNone)\((.*)\)/ # rubocop:disable Layout/LineLength
    pattern_meta = /\s*self.meta\[.*\]\s*=\s*.*/
    pattern_meta_display = /\s*self.meta\[["']output["']\]\s*=\s*(.*)/
    reg_test = Regexp.new(pattern_test)
    reg_meta = Regexp.new(pattern_meta)
    reg_meta_display = Regexp.new(pattern_meta_display)

    test_cases_regex = autograde_content.scan(reg_test)

    # Loop through each test case
    test_cases_regex.each do |test_case_match|
      test_case_object = default_codaveri_test_case_template
      test_name, indentation, test_content, assertion_type, assertion_content = test_case_match

      # prefix
      prefix = test_content.gsub(reg_meta, '').gsub(/^#{indentation}/, '').strip

      # expression
      expression = assertion_types[assertion_type.to_sym].call(assertion_content)

      # display
      display_list = test_content.scan(reg_meta_display)
      display = display_list[0] ? display_list[0][0] : ''

      # combine all extracted data
      test_case_object[:id] = test_cases_with_id[test_name]
      test_case_object[:timeout] = @question.time_limit * 1000 # in millisecond
      test_case_object[:prefix] = prefix
      test_case_object[:expression] = expression
      test_case_object[:display] = display

      @test_case_files.append(test_case_object)
    end
  end

  def preload_question_test_cases
    # The regex below finds all text after the last slash
    # (eg AutoGrader/AutoGrader/test_private_4 -> test_private_4)
    @question.test_cases.pluck(:identifier, :id).to_h { |x| [x[0].match(/[^\/]+$/).to_s, x[1]] }
  end

  def assertion_types_regex
    multi_arg = ->(s) { top_level_split(s, ',').map(&:strip) }
    single_arg = ->(s) { s.strip }
    {
      Equal: ->(s) { multi_arg.call(s).join(' == ') }, # lambda s: ' == '.join(multi_arg(s)),
      NotEqual: ->(s) { multi_arg.call(s).join(' != ') }, # lambda s: ' != '.join(multi_arg(s)),
      True: ->(s) { single_arg.call(s) }, # single_arg
      False: ->(s) { "not #{single_arg.call(s)}" }, # lambda s: 'not ' + single_arg(s),
      Is: ->(s) { multi_arg.call(s).join(' is ') }, # lambda s: ' is '.join(multi_arg(s)),
      IsNot: ->(s) { multi_arg.call(s).join(' is not ') }, # lambda s: ' is not '.join(multi_arg(s)),
      IsNone: ->(s) { "#{single_arg.call(s)} is None" }, # lambda s: single_arg(s) + ' is None',
      IsNotNone: ->(s) { "#{single_arg.call(s)} is not None" } # lambda s: single_arg(s) + ' is not None',
    }
  end

  # Split `s` by the first top-level comma only.
  # Commas within parentheses are ignored.
  # Assumes valid/balanced brackets.
  # Assumes various bracket types ([{ and }]) as equivalent.
  # https://stackoverflow.com/a/33527583
  def top_level_split(text, delimiter)
    opening = '([{'
    closing = ')]}'
    balance = 0
    idx = 0
    while idx < text.length
      char = text[idx]
      if opening.include? char
        balance += 1
      elsif closing.include? char
        balance -= 1
      elsif (char == delimiter) && (balance == 0)
        return text[0...idx], text[idx + 1...]
      end
      idx += 1
    end
    raise TypeError, "ill-formatted text: #{text}"
  end
end
# rubocop:enable Metrics/abcSize
