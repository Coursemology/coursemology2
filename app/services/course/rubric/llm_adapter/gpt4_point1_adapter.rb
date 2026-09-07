# frozen_string_literal: true
# The full-size non-reasoning model, for rubrics the mini variant grades too coarsely.
class Course::Rubric::LlmAdapter::Gpt4Point1Adapter < Course::Rubric::LlmService::LlmAdapter
  include Course::Rubric::LlmAdapter::OpenAiChatApiConcern

  def model
    'gpt-4.1'
  end

  # Grade as deterministically as the API allows.
  def request_options
    { temperature: 0 }
  end
end
