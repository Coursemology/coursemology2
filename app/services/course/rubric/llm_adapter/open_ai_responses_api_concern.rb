# frozen_string_literal: true
# Speaks the OpenAI Responses API (via ruby-openai >= 8.0), which reasoning models are designed for and which
# langchainrb does not yet cover. Reasoning models reject +temperature+, so nothing is sent unless the adapter
# asks for it; structured output is requested through +text.format+ instead of +response_format+.
#
# Includers supply #model and #request_options (see Course::Rubric::LlmService::LlmAdapter).
module Course::Rubric::LlmAdapter::OpenAiResponsesApiConcern
  extend ActiveSupport::Concern

  MAX_RETRIES = 1

  def structured_completion(messages:, schema:, schema_name:)
    retries = 0
    begin
      response = client.responses.create(parameters: request_parameters(messages, schema, schema_name))
      JSON.parse(output_text(response))
    rescue JSON::ParserError
      raise if retries >= MAX_RETRIES

      retries += 1
      retry
    end
  end

  private

  def client
    Course::Rubric::Llm.responses_client
  end

  def request_parameters(messages, schema, schema_name)
    {
      **effective_request_options,
      model: model,
      input: messages,
      # The Responses API stores responses for 30 days by default (unlike Chat Completions, which does not
      # store unless asked). The payload here is the student's answer plus the question, rubric and any
      # linked context, and nothing in this service ever retrieves a stored response, so storage would be
      # retention we gain nothing from. Set after the options spread so a course cannot switch it back on:
      # opting into provider-side retention of student work is not a per-course grading knob.
      store: false,
      text: text_options(schema, schema_name)
    }
  end

  # `text` carries the structured-output format, but it is also where the provider puts sibling options a
  # course may legitimately configure (`verbosity`, for one), so the configured object is merged rather than
  # replaced. Only `format` is forced -- this service parses the response against the schema, so structured
  # output is not negotiable. A non-object `text` cannot be merged and is dropped; the provider would have
  # rejected it anyway.
  def text_options(schema, schema_name)
    configured = effective_request_options[:text]
    configured = {} unless configured.is_a?(Hash)

    configured.merge(format: { type: 'json_schema', name: schema_name, strict: true, schema: schema })
  end

  # The Responses output array interleaves reasoning items with the assistant message; pull the message's
  # output_text (the schema-conforming JSON string).
  def output_text(response)
    message = Array(response['output']).find { |item| item['type'] == 'message' }
    part = Array(message&.dig('content')).find { |content| content['type'] == 'output_text' }
    part&.dig('text').to_s
  end
end
