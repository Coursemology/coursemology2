# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Rubric::LlmAdapter::Gpt5Point6LunaAdapter do
  let(:responses) { instance_double(OpenAI::Responses) }
  let(:client) { instance_double(OpenAI::Client, responses: responses) }
  subject(:adapter) { described_class.new }

  before { allow(Course::Rubric::LlmService::LlmAdapter).to receive(:responses_client).and_return(client) }

  let(:schema) { { 'type' => 'object', 'properties' => {}, 'required' => [] } }
  let(:messages) { [{ role: 'system', content: 'grade' }, { role: 'user', content: 'answer' }] }
  let(:payload) do
    {
      'output' => [
        { 'type' => 'reasoning', 'content' => [] },
        { 'type' => 'message',
          'content' => ['type' => 'output_text', 'text' => '{"feedback":"ok","category_grades":{}}'] }
      ]
    }
  end

  it 'names the model and reasons at low effort, without a temperature' do
    expect(adapter.model).to eq('gpt-5.6-luna')
    expect(adapter.request_options).to eq({ reasoning: { effort: 'low' } })
    expect(adapter.request_options).not_to have_key(:temperature)
  end

  it 'omits temperature, sets reasoning effort, and requests strict json_schema output' do
    expect(responses).to receive(:create) do |parameters:|
      expect(parameters[:model]).to eq('gpt-5.6-luna')
      expect(parameters[:input]).to eq(messages)
      expect(parameters).not_to have_key(:temperature)
      expect(parameters.dig(:reasoning, :effort)).to eq('low')
      # The API stores responses by default; student answers must not be retained provider-side.
      expect(parameters[:store]).to be(false)
      format = parameters.dig(:text, :format)
      expect(format).to include(type: 'json_schema', name: 'rubric_grading_response', strict: true, schema: schema)
      payload
    end

    result = adapter.structured_completion(messages: messages, schema: schema, schema_name: 'rubric_grading_response')
    expect(result).to eq({ 'feedback' => 'ok', 'category_grades' => {} })
  end

  it 'extracts the assistant message output_text past any reasoning items' do
    allow(responses).to receive(:create).and_return(payload)
    result = adapter.structured_completion(messages: messages, schema: schema, schema_name: 'x')
    expect(result['feedback']).to eq('ok')
  end

  it 'keeps storage off even when the course overrides the request options' do
    adapter = described_class.new(request_options_override: { store: true, max_output_tokens: 512 })
    expect(responses).to receive(:create) do |parameters:|
      expect(parameters[:max_output_tokens]).to eq(512)
      expect(parameters[:store]).to be(false)
      payload
    end

    adapter.structured_completion(messages: messages, schema: schema, schema_name: 'x')
  end

  it 'keeps a course\'s other text options while forcing the structured output format' do
    adapter = described_class.new(request_options_override: { text: { verbosity: 'low' } })
    expect(responses).to receive(:create) do |parameters:|
      expect(parameters.dig(:text, :verbosity)).to eq('low')
      expect(parameters.dig(:text, :format, :type)).to eq('json_schema')
      payload
    end

    adapter.structured_completion(messages: messages, schema: schema, schema_name: 'x')
  end

  it 'retries once when the model returns malformed JSON' do
    malformed = { 'output' => ['type' => 'message', 'content' => ['type' => 'output_text', 'text' => 'nope']] }
    allow(responses).to receive(:create).and_return(malformed, payload)
    expect(adapter.structured_completion(messages: messages, schema: schema, schema_name: 'x')).to eq(
      { 'feedback' => 'ok', 'category_grades' => {} }
    )
    expect(responses).to have_received(:create).twice
  end
end
