# frozen_string_literal: true
class Course::Assessment::Question::CodaveriProblemGenerationService
  POLL_INTERVAL_SECONDS = 2
  MAX_POLL_RETRIES = 1000

  def codaveri_generate_problem
    response_status, response_body, generation_id = send_problem_generation_request
    poll_count = 0
    until ![201, 202].include?(response_status) || poll_count >= MAX_POLL_RETRIES
      sleep(POLL_INTERVAL_SECONDS)
      response_status, response_body = fetch_problem_generation_result(generation_id)
      poll_count += 1
    end

    response_success = response_body['success']
    if response_status == 200 && response_success
      response_body
    else
      raise CodaveriError,
            { status: response_status, body: response_body }
    end
  end

  private

  def initialize(assessment, params, language, version)
    custom_prompt = params[:custom_prompt]
    @payload = {
      userId: assessment.creator_id.to_s,
      courseName: assessment.course.title,
      languageVersion: {
        language: language,
        version: version
      },
      llmConfig: {
        customPrompt: (custom_prompt.length >= 500) ? "#{custom_prompt[0...495]}..." : custom_prompt,
        testcasesType: 'expression'
      },
      requireToken: true,
      tokenConfig: {
        returnResult: true
      }
    }

    return unless params[:is_default_question_form_data] == 'false'

    template_file_name = generate_payload_file_name(language, params[:template])
    solution_file_name = generate_payload_file_name(language, params[:solution])

    @payload = @payload.merge({
      problem: {
        title: params[:title],
        description: params[:description],
        templates: [{
          path: template_file_name,
          content: params[:template] || ''
        }],
        solutions: [{
          tag: 'solution',
          files: [{
            path: solution_file_name,
            content: params[:solution] || ''
          }]
        }],
        exprTestcases: []
      }
    })

    append_test_cases_to_problem_payload('public', params[:public_test_cases])
    append_test_cases_to_problem_payload('private', params[:private_test_cases])
    append_test_cases_to_problem_payload('hidden', params[:evaluation_test_cases])
  end

  def generate_payload_file_name(codaveri_language, file_content)
    return 'main.py' if codaveri_language == 'python'

    match = file_content&.match(/\bclass\s+(\w+)\s*\{/)
    match ? "#{match[1]}.java" : 'Main.java'
  end

  def send_problem_generation_request
    codaveri_api_service = CodaveriAsyncApiService.new('problem/generate/coding', @payload)
    response_status, response_body = codaveri_api_service.post

    response_success = response_body['success']

    if response_status == 201 && response_success
      [response_status, response_body, response_body['data']['id']]
    elsif response_status == 200 && response_success
      [response_status, response_body, nil]
    else
      raise CodaveriError,
            { status: response_status, body: response_body }
    end
  end

  def fetch_problem_generation_result(generation_id)
    codaveri_api_service = CodaveriAsyncApiService.new('problem/generate/coding', { id: generation_id })
    codaveri_api_service.get
  end

  def append_test_cases_to_problem_payload(visibility, test_cases)
    return unless test_cases

    parsed_test_cases = JSON.parse(test_cases)

    parsed_test_cases.each_value do |test_case|
      @payload[:problem][:exprTestcases] << {
        index: @payload[:problem][:exprTestcases].length + 1,
        visibility: visibility,
        hint: test_case['hint'],
        prefix: test_case['inlineCode'] || '',
        lhsExpression: test_case['expression'],
        rhsExpression: test_case['expected'],
        display: test_case['expression']
      }
    end
  end
end
