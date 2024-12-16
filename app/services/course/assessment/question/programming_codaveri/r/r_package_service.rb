# frozen_string_literal: true
# rubocop:disable Metrics/abcSize
class Course::Assessment::Question::ProgrammingCodaveri::R::RPackageService <
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

  # Extracts the main solution of a programing question problem and append it to the
  # [:resources][0][:solutions] array array for the problem management API request body.
  def extract_main_solution
    main_solution_object = default_codaveri_solution_template

    solution_files = @package.solution_files

    main_solution_object[:path] = 'template.R'
    main_solution_object[:content] = solution_files[Pathname.new('template.R')]
    return if main_solution_object[:content].blank?

    @solution_files.append(main_solution_object)
  end

  # In a programming question package, there may be data files that are included in the package
  # The contents of these files are appended to the "additionalFiles" array in the API Request main body.
  def extract_supporting_files
    extract_supporting_main_files
    extract_supporting_tests_files
    extract_supporting_submission_files
    extract_supporting_solution_files
  end

  # Finds and extracts all contents of additional files in the root package folder
  # (excluding the default Makefile and .meta files).
  # All data files uploaded through the Coursemology UI will be extracted in this function.
  # The remaining functions are to capture files manually added to the package ZIP by the user.
  def extract_supporting_main_files
    main_files = @package.main_files.compact.to_h
    main_filenames = main_files.keys

    main_filenames.each do |filename|
      next if ['Makefile', '.meta', 'report-public.xml', 'report-private.xml',
               'report-evaluation.xml'].include?(filename.to_s)

      extract_supporting_file(filename, main_files[filename])
    end
  end

  # Finds and extracts all contents of additional files in the test files folder
  # (excluding the default append.R and prepend.R files).
  def extract_supporting_tests_files
    test_files = @package.test_files
    test_filenames = test_files.keys

    test_filenames.each do |filename|
      next if ['append.R', 'prepend.R'].include?(filename.to_s)

      extract_supporting_file(filename, test_files[filename])
    end
  end

  # Finds and extracts all contents of additional files in the submission files folder
  # (excluding the default template.R file).
  def extract_supporting_submission_files
    submission_files = @package.submission_files
    submission_filenames = submission_files.keys

    submission_filenames.each do |filename|
      next if ['template.R'].include?(filename.to_s)

      extract_supporting_file(filename, submission_files[filename])
    end
  end

  # Finds and extracts all contents of additional files in the solution files folder
  # (excluding the default template.R file).
  def extract_supporting_solution_files
    solution_files = @package.solution_files
    solution_filenames = solution_files.keys

    solution_filenames.each do |filename|
      next if ['template.R'].include?(filename.to_s)

      extract_supporting_file(filename, solution_files[filename])
    end
  end

  # Extracts filename and content of a data file and append it to the
  # [:additionalFiles] array for the problem management API request body.
  #
  # @param [Pathname] pathname The pathname of the file.
  # @param [String] content The content of the file.
  def extract_supporting_file(filename, content)
    supporting_file_object = default_codaveri_data_file_template

    supporting_file_object[:type] = 'internal' # 'external' s3 upload not yet implemented by codaveri
    supporting_file_object[:path] = filename.to_s
    if content.force_encoding('UTF-8').valid_encoding?
      supporting_file_object[:content] = content
      supporting_file_object[:encoding] = 'utf8'
    else
      supporting_file_object[:content] = Base64.strict_encode64(content)
      supporting_file_object[:encoding] = 'base64'
    end

    @data_files.append(supporting_file_object)
  end

  # Extracts test cases from the built dummy reports and append all the test cases to the
  # [:IOTestcases] array for the problem management API request body.
  def extract_test_cases
    test_cases_with_id = preload_question_test_cases
    @package.test_reports.each do |test_type, test_report|
      Course::Assessment::ProgrammingTestCaseReport.new(test_report).test_cases.each do |test_case|
        test_case_object = default_codaveri_io_test_case_template

        # combine all extracted data
        test_case_object[:index] = test_cases_with_id[test_case.name]
        test_case_object[:timeout] = @question.time_limit * 1000 if @question.time_limit # in millisecond
        test_case_object[:input] = test_case.expression
        test_case_object[:output] = test_case.expected
        test_case_object[:hint] = test_case.hint
        test_case_object[:display] = test_case.display
        test_case_object[:visibility] = codaveri_test_case_visibility(test_type)
        @test_case_files.append(test_case_object)
      end
    end
  end

  # Extracts template file from submissions folder and append it to the
  # [:resources][0][:templates] array for the problem management API request body.
  def extract_template
    main_template_object = default_codaveri_template_template

    submission_files = @package.submission_files
    test_files = @package.test_files

    main_template_object[:path] = 'template.R'
    main_template_object[:content] = submission_files[Pathname.new('template.R')]

    main_template_object[:prefix] = test_files[Pathname.new('prepend.R')]
    main_template_object[:suffix] = test_files[Pathname.new('append.R')]

    @template_files.append(main_template_object)
  end

  def preload_question_test_cases
    # The regex below finds all text after the last slash
    # (eg AutoGrader/AutoGrader/test_private_4 -> test_private_4)
    @question.test_cases.pluck(:identifier, :id).to_h { |x| [x[0].match(/[^\/]+$/).to_s, x[1]] }
  end

  def codaveri_test_case_visibility(test_case_type)
    case test_case_type
    when :public
      'public'
    when :private
      'private'
    when :evaluation
      'hidden'
    else
      test_case_type
    end
  end
end
# rubocop:enable Metrics/abcSize
