# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Rubric::LlmAdapter::Gpt4Point1MiniAdapter do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:assessment) { create(:assessment, :published_with_rubric_question) }
    let(:question) { assessment.questions.first.specific }
    let!(:active_rubric) do
      Course::Rubric.build_from_v1(question, assessment.course).tap do |rubric|
        rubric.save!
        question.acting_as.update_column(:active_rubric_id, rubric.id)
      end
    end
    let(:categories) { active_rubric.categories }
    let(:rubric_adapter) { Course::Rubric::RubricAdapter.new(active_rubric) }

    # In the test suite chat_client is the stubbed langchain OpenAI (see spec/support/langchain.rb).
    subject(:adapter) { described_class.new }

    let(:output_parser) do
      Langchain::OutputParsers::StructuredOutputParser.from_json_schema(rubric_adapter.generate_dynamic_schema)
    end

    it 'names the model and grades at temperature 0' do
      expect(adapter.model).to eq('gpt-4.1-mini')
      expect(adapter.request_options).to eq({ temperature: 0 })
    end

    describe '#fix_and_parse' do
      let(:valid_json) do
        category_fields = categories.map do |category|
          "\"category_#{category.id}\": {
            \"criterion_id_with_grade\":
              \"criterion_#{category.criterions.first.id}_grade_#{category.criterions.first.grade}\",
            \"explanation\": \"selection explanation\"
          }"
        end.join(',')

        <<~JSON
          { "category_grades": { #{category_fields} }, "feedback": "feedback" }
        JSON
      end
      let(:invalid_json) { '{ "category_grades": [{ "missing": "closing bracket" }' }

      context 'with valid JSON' do
        it 'returns the parsed output without needing a fix' do
          expect(adapter.fix_and_parse(valid_json, output_parser)).to eq(JSON.parse(valid_json))
        end
      end

      context 'with invalid JSON' do
        it 'has the model repair the output and parses it' do
          result = adapter.fix_and_parse(invalid_json, output_parser)
          categories.each do |category|
            field_name = "category_#{category.id}"
            expect(result['category_grades'][field_name]).to be_present
            criterion_id_with_grade = result['category_grades'][field_name]['criterion_id_with_grade']
            expect(criterion_id_with_grade).to match(/criterion_(\d+)_grade_(\d+)/)
            criterion_id, grade = criterion_id_with_grade.match(/criterion_(\d+)_grade_(\d+)/).captures
            criterion = category.criterions.find { |c| c.id == criterion_id.to_i }
            expect(criterion).to be_present
            expect(grade.to_i).to eq(criterion.grade)
            expect(result['category_grades'][field_name]['explanation']).to be_a(String)
          end
          expect(result['feedback']).to be_a(String)
        end
      end
    end

    describe 'the model and options the requests carry' do
      # A spy in place of the shared stub, so the parameters each call sends can be inspected. Restored
      # after the example: chat_client is global (see spec/support/langchain.rb).
      let(:spy_client) { Langchain::LlmStubs::OpenAiStub.new }
      let(:adapter) { Course::Rubric::LlmAdapter::Gpt4Point1Adapter.new(request_options_override: { top_p: 0.5 }) }
      around do |example|
        original = Course::Rubric::LlmService::LlmAdapter.chat_client
        Course::Rubric::LlmService::LlmAdapter.chat_client = spy_client
        example.run
        Course::Rubric::LlmService::LlmAdapter.chat_client = original
      end

      it "repairs malformed output with the adapter's own model and options, not the client's defaults" do
        allow(spy_client).to receive(:chat).and_call_original

        adapter.fix_and_parse('{ not json', output_parser)

        expect(spy_client).to have_received(:chat).
          with(hash_including(model: 'gpt-4.1', top_p: 0.5))
      end
    end

    # End-to-end #structured_completion (real grading messages through the stubbed client) is covered by
    # Course::Rubric::LlmService's #evaluate spec.
  end
end
