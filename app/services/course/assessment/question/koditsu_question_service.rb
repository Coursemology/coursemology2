# frozen_string_literal: true
class Course::Assessment::Question::KoditsuQuestionService
  include Course::Assessment::Question::KoditsuQuestionConcern

  def initialize(question, workspace_id, meta, course)
    # TODO: support file upload (image) if the question set includes image
    @question = question
    @workspace_id = workspace_id
    @type = @question.language.type.constantize
    @course = course

    set_time_limits
    @metadata = meta[:data]
    build_all_test_cases

    @question_object = build_question_object
  end

  def run_create_koditsu_question
    new_question_object = @question_object.merge({
      workspaceId: @workspace_id
    })

    koditsu_api_service = KoditsuAsyncApiService.new('api/question/coding', new_question_object)
    response_status, response_body = koditsu_api_service.post

    if response_status == 201
      [response_status, response_body['data']]
    else
      [response_status, nil]
    end
  end

  def run_edit_koditsu_question(id)
    koditsu_api_service = KoditsuAsyncApiService.new("api/question/coding/#{id}", @question_object)
    response_status, = koditsu_api_service.put

    response_status
  end

  private

  def set_time_limits
    @time_limit = @question.time_limit || @course.programming_max_time_limit.to_i
    @time_limit_ms = @time_limit * 1000
  end

  def build_all_test_cases
    @test_cases = []
    build_test_cases(@metadata['test_cases']['public'])
    build_test_cases(@metadata['test_cases']['private'])
    build_test_cases(@metadata['test_cases']['evaluation'])
  end

  def build_test_cases(test_cases)
    test_cases.each do |testcase|
      @test_cases << {
        index: @test_cases.length + 1,
        timeout: @time_limit_ms,
        hint: testcase['hint'],
        prefix: '',
        lhsExpression: testcase['expression'],
        rhsExpression: testcase['expected'],
        display: testcase['expression']
      }
    end
  end

  def build_question_object
    {
      title: @question.title,
      description: @question.description,
      resources: [{
        languageVersions: {
          language: koditsu_programming_language_map[@type][:language],
          versions: [koditsu_programming_language_map[@type][:version]]
        },
        templates: [{
          path: koditsu_programming_language_map[@type][:filename],
          content: @metadata['submission'],
          prefix: truncate_google_test_framework_and_clean_comments(@metadata['prepend']),
          suffix: truncate_google_test_framework_and_clean_comments(@metadata['append'])
        }],
        exprTestcases: @test_cases
      }]
    }
  end

  def clean_comments_for_cpp(snippet)
    no_single_line_comments_snippet = snippet.gsub(/\/\/.*$/, '')

    # remove multiple line comments, and return
    no_single_line_comments_snippet.gsub(/\/\*.*?\*\//m, '')
  end

  def truncate_google_test_framework_and_clean_comments(snippet)
    return snippet unless koditsu_programming_language_map[@type][:language] == 'cpp'

    cleaned_snippet_from_comments = clean_comments_for_cpp(snippet)
    truncate_google_test_framework_for_cpp(cleaned_snippet_from_comments)
  end

  # The evaluation mechanism for C/C++ question in Coursemology is dependent on the Google
  # Test framework, and hence user needs to include the code snippet that complies with how
  # Google Test framework should be used, either in prepend or append. However, Koditsu
  # does not use it, and the inclusion of that mentioned code snippet will result in the
  # runtime error inside Koditsu evaluator. Hence, we should strip the code snippet that
  # corresponds to Google Test framework before sending our data to Koditsu.
  def truncate_google_test_framework_for_cpp(snippet)
    start_pattern = /class\s+GlobalEnv\s*:\s*public\s+testing::Environment\s*{/

    if snippet =~ start_pattern
      start_index = snippet.index(start_pattern)
      current_index = start_index + snippet.match(start_pattern)[0].length

      current_index = find_truncation_point(snippet, current_index)

      snippet[0...start_index] + snippet[current_index..]
    else
      snippet
    end
  end

  def find_truncation_point(snippet, current_index)
    open_braces = 1

    while current_index < snippet.length && open_braces > 0
      char = snippet[current_index]
      open_braces = update_brace_count(char, open_braces)

      current_index += 1
    end

    current_index + 1
  end

  def update_brace_count(char, open_braces)
    open_braces += 1 if char == '{'
    open_braces -= 1 if char == '}'
    open_braces
  end
end
