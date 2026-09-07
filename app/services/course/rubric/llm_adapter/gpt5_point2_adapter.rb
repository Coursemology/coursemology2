# frozen_string_literal: true
# Previous-generation flagship reasoning model; superseded by the 5.6 line but still supported.
class Course::Rubric::LlmAdapter::Gpt5Point2Adapter < Course::Rubric::LlmService::LlmAdapter
  include Course::Rubric::LlmAdapter::OpenAiResponsesApiConcern

  def model
    'gpt-5.2'
  end

  # Grading is a bounded task, so the deliberation budget buys little but costs latency and tokens. Sent
  # explicitly because this model family's own default differs (none).
  def request_options
    { reasoning: { effort: 'low' } }
  end
end
