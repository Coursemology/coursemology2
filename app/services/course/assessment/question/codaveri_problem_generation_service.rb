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

  # Creates a new service codaveri feedback rating object.
  #
  # @param [Course::Discussion::Post::CodaveriFeedback] feedback Feedback to be sent to Codaveri
  def initialize(assessment, custom_prompt, language, version, difficulty)
    @payload = {
      userId: assessment.creator_id.to_s,
      courseName: assessment.course.title,
      config: {
        difficulty: difficulty,
        customPrompt: custom_prompt.length >= 500 ? "#{custom_prompt[0...495]}..." : custom_prompt,
        testcasesType: 'expression',
        languageVersion: {
          language: language,
          version: version
        }
      },
      requireToken: true,
      tokenConfig: {
        returnResult: true
      }
    }
  end

  def send_problem_generation_request
    codaveri_api_service = CodaveriAsyncApiService.new('v2/problem/generate/coding', @payload)
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
    codaveri_api_service = CodaveriAsyncApiService.new('v2/problem/generate/coding', { id: generation_id })
    codaveri_api_service.get
  end
end
