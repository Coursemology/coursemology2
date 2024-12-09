# frozen_string_literal: true
if ENV['OPENAI_API_KEY'].present?
  require 'langchain'
  # Create a global OpenAI client instance
  LANGCHAIN_OPENAI = Langchain::LLM::OpenAI.new(
    api_key: ENV['OPENAI_API_KEY'],
    default_options: { temperature: 0.5, chat_completion_model_name: 'gpt-4o' }
  )
  # RAGAS (Retrieval Augmented Generation Assessment) used to evaluate RAG response
  RAGAS = Langchain::LLM::OpenAI.new(
    api_key: ENV['OPENAI_API_KEY'],
    default_options: { temperature: 0, chat_completion_model_name: 'gpt-4o' }
  )
else
  Rails.logger.error('OPENAI_API_KEY is not set in the environment')
end
