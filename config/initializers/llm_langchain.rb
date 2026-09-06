# frozen_string_literal: true
require 'langchain'
# Create a global OpenAI client instance
LANGCHAIN_OPENAI = Langchain::LLM::OpenAI.new(
  api_key: Rails.application.credentials.dig(:openai, :api_key),
  default_options: { temperature: 0, chat_model: 'gpt-4.1-mini' }
)
# RAGAS (Retrieval Augmented Generation Assessment) used to evaluate RAG response
RAGAS = Langchain::LLM::OpenAI.new(
  api_key: Rails.application.credentials.dig(:openai, :api_key),
  default_options: { temperature: 0, chat_model: 'gpt-4.1-mini' }
)

# Raw ruby-openai client, for OpenAI endpoints langchainrb does not yet cover -- currently the Responses API
# used by reasoning models (gpt-5.x) in rubric grading (see Course::Rubric::LlmAdapter::OpenAiResponsesAdapter).
OPENAI_CLIENT = OpenAI::Client.new(access_token: Rails.application.credentials.dig(:openai, :api_key))

# Suppress logs to only show when there is an error
Langchain.logger.level = :error
