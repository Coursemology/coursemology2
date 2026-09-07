# frozen_string_literal: true
# The model an answer is graded with -- the fourth adapter alongside the question, rubric and answer ones.
# Concrete subclasses name a single model, declare its request options, and mix in the API concern that knows
# how to speak to it (see Course::Rubric::LlmAdapter::OpenAiChatApiConcern / OpenAiResponsesApiConcern).
#
# The class methods below are the model registry: they resolve a stored model name to its adapter and hold
# the provider clients the adapters talk through. The models we support are ours to choose -- independent of
# the list Codaveri happens to support (Course::Settings::CodaveriComponent.all_models).
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

    # Resolved lazily so the adapters are autoloaded on first use rather than when this file loads.
    # Keys are the provider's model ids, which is what an admin picker persists.
    def adapters
      @adapters ||= {
        # Non-reasoning (Chat Completions).
        'gpt-4.1-mini' => Course::Rubric::LlmAdapter::Gpt4Point1MiniAdapter,
        'gpt-4.1' => Course::Rubric::LlmAdapter::Gpt4Point1Adapter,
        # Reasoning (Responses API).
        'gpt-5.2' => Course::Rubric::LlmAdapter::Gpt5Point2Adapter,
        'gpt-5.4' => Course::Rubric::LlmAdapter::Gpt5Point4Adapter,
        'gpt-5.4-mini' => Course::Rubric::LlmAdapter::Gpt5Point4MiniAdapter,
        'gpt-5.4-nano' => Course::Rubric::LlmAdapter::Gpt5Point4NanoAdapter,
        'gpt-5.5' => Course::Rubric::LlmAdapter::Gpt5Point5Adapter,
        'gpt-5.6-luna' => Course::Rubric::LlmAdapter::Gpt5Point6LunaAdapter,
        'gpt-5.6-terra' => Course::Rubric::LlmAdapter::Gpt5Point6TerraAdapter,
        'gpt-5.6-sol' => Course::Rubric::LlmAdapter::Gpt5Point6SolAdapter
      }.freeze
    end

    def available_models
      adapters.keys
    end

    # @param model [String] a key from .available_models
    # @return [Course::Rubric::LlmService::LlmAdapter]
    def build(model = DEFAULT_MODEL, request_options_override: nil, system_prompt_override: nil)
      adapters.fetch(model.to_s) do
        raise ArgumentError, "Unsupported rubric grading model: #{model}"
      end.new(request_options_override: request_options_override, system_prompt_override: system_prompt_override)
    end

    # The adapter a course grades with: its configured model, request options and system prompt, each
    # falling back to the model's own default when the course has not explicitly overridden it.
    # @return [Course::Rubric::LlmService::LlmAdapter]
    def for_course(course)
      build(course.rubric_grading_model.presence || DEFAULT_MODEL,
            request_options_override: course.rubric_grading_model_options_override,
            system_prompt_override: course.rubric_grading_system_prompt_override)
    end
  end

  # Replaces the built-in grading system prompt wholesale when the course configures one.
  # @return [String, nil]
  attr_reader :system_prompt_override

  # @param request_options_override [Hash, nil] course-configured options replacing this model's own
  #   (see Course#rubric_grading_model_options), or nil to keep this model's own.
  def initialize(request_options_override: nil, system_prompt_override: nil)
    @request_options_override = request_options_override
    @system_prompt_override = system_prompt_override
  end

  # The provider's identifier for this model, e.g. 'gpt-4.1-mini'.
  # @return [String]
  def model
    raise NotImplementedError, 'Subclasses must implement this'
  end

  # This model's own defaults, e.g. { temperature: 0 } for chat models or { reasoning: { effort: 'low' } }
  # for reasoning models. Subclasses override; these are what a course sees as "the defaults".
  # @return [Hash]
  def request_options
    {}
  end

  # What is actually sent: the course's options if it configured any, otherwise this model's own. A
  # wholesale replacement rather than a merge, so what is sent is exactly what the configuring admin wrote --
  # a merge would leave defaults the admin cannot see (and, for reasoning models, cannot legally combine
  # with what they wrote) silently in the request.
  # @return [Hash]
  def effective_request_options
    @request_options_override || request_options
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
