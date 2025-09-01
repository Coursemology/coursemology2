# frozen_string_literal: true
require 'langchain'
# Create a global OpenAI client instance
LANGCHAIN_OPENAI = Langchain::LLM::OpenAI.new(
  api_key: ENV.fetch('OPENAI_API_KEY', nil),
  default_options: { temperature: 0.5, chat_model: 'gpt-5-nano' }
)
# RAGAS (Retrieval Augmented Generation Assessment) used to evaluate RAG response
RAGAS = Langchain::LLM::OpenAI.new(
  api_key: ENV.fetch('OPENAI_API_KEY', nil),
  default_options: { temperature: 0, chat_model: 'gpt-5-mini' }
)

# Suppress logs to only show when there is an error
Langchain.logger.level = :error
