# frozen_string_literal: true
# Reasoning model.
class Course::Rubric::LlmAdapter::Gpt5Point4Adapter < Course::Rubric::LlmService::LlmAdapter
  include Course::Rubric::LlmAdapter::OpenAiResponsesApiConcern

  def model
    'gpt-5.4'
  end

  # Grading is a bounded task, so the deliberation budget buys little but costs latency and tokens. Sent
  # explicitly because this model family's own default differs (none).
  def request_options
    { reasoning: { effort: 'low' } }
  end
end
