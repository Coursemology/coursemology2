# frozen_string_literal: true
# Reasoning model.
class Course::Rubric::LlmAdapter::Gpt5Point5Adapter < Course::Rubric::LlmService::LlmAdapter
  include Course::Rubric::LlmAdapter::OpenAiResponsesApiConcern

  def model
    'gpt-5.5'
  end

  # Grading is a bounded task, so the deliberation budget buys little but costs latency and tokens. Sent
  # explicitly because this model family's own default differs (medium).
  def request_options
    { reasoning: { effort: 'low' } }
  end
end
