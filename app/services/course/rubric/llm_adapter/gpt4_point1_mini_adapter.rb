# frozen_string_literal: true
# The default rubric grading model: fast, cheap, and deterministic enough at temperature 0.
class Course::Rubric::LlmAdapter::Gpt4Point1MiniAdapter < Course::Rubric::LlmService::LlmAdapter
  include Course::Rubric::LlmAdapter::OpenAiChatApiConcern

  def model
    'gpt-4.1-mini'
  end

  # Grade as deterministically as the API allows.
  def request_options
    { temperature: 0 }
  end
end
