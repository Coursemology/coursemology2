# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Rubric::LlmService::LlmAdapter do
  describe '.adapters' do
    it 'registers every model under the provider id its adapter sends' do
      # Guards against a typo in either the registry key or the adapter's #model: a mismatch would only
      # surface as a 404 from the provider at grading time.
      described_class.adapters.each do |model_name, adapter_class|
        expect(adapter_class.new.model).to eq(model_name)
      end
    end

    it 'only registers adapters implementing the LlmAdapter port' do
      described_class.adapters.each_value do |adapter_class|
        expect(adapter_class.new).to be_a(Course::Rubric::LlmService::LlmAdapter)
        expect(adapter_class.new).to respond_to(:structured_completion)
      end
    end
  end

  describe '.build' do
    it 'builds the adapter registered for the model' do
      expect(described_class.build('gpt-5.6-sol')).to be_a(Course::Rubric::LlmAdapter::Gpt5Point6SolAdapter)
    end

    it 'defaults to the current grading model' do
      expect(described_class.build.model).to eq(described_class::DEFAULT_MODEL)
    end

    it 'raises for an unregistered model' do
      expect { described_class.build('gpt-4o-mini-transcribe') }.
        to raise_error(ArgumentError, /Unsupported rubric grading model/)
    end
  end

  describe '.for_course' do
    let(:instance) { Instance.default }
    with_tenant(:instance) do
      let(:course) { create(:course) }

      it 'falls back to the default model and its own options when unconfigured' do
        adapter = described_class.for_course(course)
        expect(adapter.model).to eq(described_class::DEFAULT_MODEL)
        expect(adapter.effective_request_options).to eq(adapter.request_options)
      end

      it 'uses the configured model' do
        course.update!(rubric_grading_model: 'gpt-5.6-terra')
        expect(described_class.for_course(course).model).to eq('gpt-5.6-terra')
      end

      it 'carries the course system prompt override, which LlmService reads off the adapter' do
        expect(described_class.for_course(course).system_prompt_override).to be_nil

        course.update!(rubric_grading_system_prompt_enabled: true, rubric_grading_system_prompt: 'Grade strictly.')
        expect(described_class.for_course(course).system_prompt_override).to eq('Grade strictly.')
      end

      it 'keeps the built-in system prompt while the override is disabled' do
        course.update!(rubric_grading_system_prompt: 'Grade strictly.')
        expect(described_class.for_course(course).system_prompt_override).to be_nil
      end

      it 'replaces the model defaults with the configured options rather than merging them' do
        course.update!(rubric_grading_model: 'gpt-5.6-sol',
                       rubric_grading_model_options_enabled: true,
                       rubric_grading_model_options: '{"max_output_tokens":2048}')
        adapter = described_class.for_course(course)

        expect(adapter.request_options).to eq({ reasoning: { effort: 'low' } })
        expect(adapter.effective_request_options).to eq({ max_output_tokens: 2048 })
      end

      it "keeps the model's own options while the override is disabled" do
        course.update!(rubric_grading_model: 'gpt-5.6-sol',
                       rubric_grading_model_options: '{"max_output_tokens":2048}')
        adapter = described_class.for_course(course)

        expect(adapter.effective_request_options).to eq({ reasoning: { effort: 'low' } })
      end
    end
  end

  describe '.available_models' do
    it 'lists the registered model names' do
      expect(described_class.available_models).to include('gpt-4.1-mini', 'gpt-5.6-luna', 'gpt-5.6-sol')
      expect(described_class.available_models).to eq(described_class.adapters.keys)
    end
  end
end
