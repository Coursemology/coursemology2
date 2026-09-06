# frozen_string_literal: true
# The model an answer is graded with -- the fourth adapter alongside the question, rubric and answer ones.
# Concrete subclasses name a single model, declare its request options, and mix in the API concern that knows
# how to speak to it (see Course::Rubric::LlmAdapter::OpenAiChatApiConcern / OpenAiResponsesApiConcern).
class Course::Rubric::LlmService::LlmAdapter
  DEFAULT_MODEL = 'gpt-4.1-mini'

  class << self
    # Provider clients, exposed so the environment (and the test suite) can swap them. Read off this base
    # class rather than +self+, so a subclass does not shadow them with its own nil ivar.
    attr_writer :chat_client, :responses_client

    # langchain OpenAI client, used by adapters on the Chat Completions API.
    def chat_client
      @chat_client ||= LANGCHAIN_OPENAI
    end

    # ruby-openai client, used by adapters on the Responses API.
    def responses_client
      @responses_client ||= OPENAI_CLIENT
    end

    def available_models
      adapters.keys
    end

    # @param model [String] a key from .available_models
    # @return [Course::Rubric::LlmService::LlmAdapter]
    def build(model = DEFAULT_MODEL, request_options_override: {}, system_prompt_override: nil)
      adapters.fetch(model.to_s) do
        raise ArgumentError, "Unsupported rubric grading model: #{model}"
      end.new(request_options_override: request_options_override, system_prompt_override: system_prompt_override)
    end

    # The adapter a course grades with: its configured model, option overrides and system prompt override,
    # each falling back to the built-in default when unset.
    # @return [Course::Rubric::LlmService::LlmAdapter]
    def for_course(course)
      build(course.rubric_grading_model.presence || DEFAULT_MODEL,
            request_options_override: course.rubric_grading_model_options_hash,
            system_prompt_override: course.rubric_grading_system_prompt)
    end
  end

  # The provider's identifier for this model, e.g. 'gpt-4.1-mini'.
  # @return [String]
  def model
    raise NotImplementedError, 'Subclasses must implement this'
  end

  # Model-specific request parameters merged into every call, e.g. { temperature: 0 } for chat models or
  # { reasoning: { effort: 'low' } } for reasoning models.
  # @return [Hash]
  def request_options
    {}
  end

  # Sends the grading prompt and returns the model's response parsed against +schema+.
  #
  # @param messages [Array<{role: String, content: String}>]
  # @param schema [Hash] JSON schema describing the required response object
  # @param schema_name [String] a name for the schema (some providers require one)
  # @return [Hash]
  def structured_completion(messages:, schema:, schema_name:)
    raise NotImplementedError, 'Subclasses must implement this'
  end
end
