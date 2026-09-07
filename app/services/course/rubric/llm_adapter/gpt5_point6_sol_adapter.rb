# frozen_string_literal: true
# The 5.6 line's flagship reasoning model, for the hardest rubrics.
class Course::Rubric::LlmAdapter::Gpt5Point6SolAdapter < Course::Rubric::LlmService::LlmAdapter
  include Course::Rubric::LlmAdapter::OpenAiResponsesApiConcern

  def model
    'gpt-5.6-sol'
  end

  # Grading is a bounded task, so the deliberation budget buys little but costs latency and tokens. Sent
  # explicitly because this model family's own default differs (medium).
  def request_options
    { reasoning: { effort: 'low' } }
  end
end
