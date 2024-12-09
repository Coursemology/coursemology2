# frozen_string_literal: true
require 'langchain'
# Create a global OpenAI client instance
LANGCHAIN_OPENAI = Langchain::LLM::OpenAI.new(
  api_key: ENV.fetch('OPENAI_API_KEY', nil),
  default_options: { temperature: 0.5, chat_completion_model_name: 'gpt-4o' }
)
# RAGAS (Retrieval Augmented Generation Assessment) used to evaluate RAG response
RAGAS = Langchain::LLM::OpenAI.new(
  api_key: ENV.fetch('OPENAI_API_KEY', nil),
  default_options: { temperature: 0, chat_completion_model_name: 'gpt-4o' }
)

# Suppress logs to only show when there is an error
Langchain.logger.level = :error
