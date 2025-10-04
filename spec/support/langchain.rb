# frozen_string_literal: true

RSpec.configure do |config|
  config.before(:suite) do
    # Replace usage of langchain instances defined in llm_langchain.rb with stubs
    Course::Rubric::LlmService.llm = Langchain::LlmStubs::STUBBED_LANGCHAIN_OPENAI
  end
end
