# frozen_string_literal: true
# Speaks the OpenAI Chat Completions API (via langchainrb), asking for strict json_schema structured output.
# Malformed output is reparsed once, then repaired by the model itself.
#
# Includers supply #model and #request_options (see Course::Rubric::LlmService::LlmAdapter).
module Course::Rubric::LlmAdapter::OpenAiChatApiConcern
  extend ActiveSupport::Concern

  MAX_RETRIES = 1

  def structured_completion(messages:, schema:, schema_name:)
    output_parser = Langchain::OutputParsers::StructuredOutputParser.from_json_schema(schema)
    retries = 0
    begin
      response = structured_chat(messages, schema, schema_name)
      output_parser.parse(response)
    rescue Langchain::OutputParsers::OutputParserException => e
      if retries < MAX_RETRIES
        retries += 1
        retry
      else
        fix_and_parse(response, output_parser, e)
      end
    end
  end

  # Has the model repair its own malformed output against the schema. Public so the parse resilience can be
  # exercised directly.
  #
  # The repair deliberately goes through this adapter's own #chat rather than through
  # Langchain::OutputParsers::OutputFixingParser#parse: that calls `llm.chat(messages:)` with neither a model
  # nor any options, so it would repair with the shared client's own defaults (gpt-4.1-mini, temperature 0)
  # instead of the model and options this course is configured to grade with. Only its prompt is reused.
  def fix_and_parse(response, output_parser, error = nil)
    output_parser.parse(response)
  rescue Langchain::OutputParsers::OutputParserException => e
    repaired = chat([role: 'user', content: fix_prompt(output_parser, response, error || e)])
    output_parser.parse(repaired)
  end

  private

  # Must be a Langchain::LLM -- OutputFixingParser requires one to build its prompt.
  def client
    Course::Rubric::LlmService::LlmAdapter.chat_client
  end

  def structured_chat(messages, schema, schema_name)
    response_format = {
      type: 'json_schema',
      json_schema: { name: schema_name, strict: true, schema: schema }
    }
    chat(messages, response_format: response_format)
  end

  # KNOWN LIMITATION -- this does not deliver the wholesale option replacement that
  # Course#rubric_grading_model_options promises, because langchainrb owns the parameters on the way out.
  # In the pinned langchainrb (0.19.5), Langchain::LLM::OpenAI#chat runs everything through
  # UnifiedParameters#to_params, which:
  #
  #   1. slices the parameters down to its own chat schema, so an option it does not know about -- a newer
  #      OpenAI field, or a typo -- is silently dropped instead of reaching the provider and failing loudly;
  #   2. re-applies the client's own defaults for anything not passed, so the client-wide `temperature: 0`
  #      (see config/initializers/llm_langchain.rb) still rides along on an override like {"top_p": 0.8};
  #   3. merges into the parameters of previous calls on the same client instance, which is shared here.
  #
  # None of this affects the Responses API adapters (they call ruby-openai directly), and it is invisible
  # while Chat models are configured with temperature alone. Should an override on a Chat model appear not
  # to take effect, this is why: the fix is to send the primary request through the raw ruby-openai client
  # like OpenAiResponsesApiConcern does, or to validate and construct the full supported option set here.
  def chat(messages, response_format: nil)
    parameters = { **effective_request_options, model: model, messages: messages }
    parameters[:response_format] = response_format if response_format
    client.chat(**parameters).completion
  end

  def fix_prompt(output_parser, response, error)
    Langchain::OutputParsers::OutputFixingParser.from_llm(llm: client, parser: output_parser).prompt.format(
      instructions: output_parser.get_format_instructions, completion: response, error: error
    )
  end
end
