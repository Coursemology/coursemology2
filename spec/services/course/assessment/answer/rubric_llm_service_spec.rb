# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::RubricLlmService do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:assessment) { create(:assessment, :published_with_rubric_question) }
    let(:question) { assessment.questions.first.specific }
    let(:category) { question.categories.first }
    let(:criterion) { category.criterions.first }
    let(:submission) do
      create(:submission, :attempting, assessment: assessment)
    end
    let(:answer) do
      create(:course_assessment_answer_rubric_based_response, :submitted,
             question: question.acting_as, submission: submission).answer.actable
    end

    describe '#evaluate' do
      let(:valid_llm_response_json) do
        <<~JSON
          {
            "category_grades": [
              {
                "category_id": #{category.id},
                "criterion_id": #{criterion.id},
                "explanation": "selection explanation"
              }
            ],
            "overall_feedback": "overall feedback"
          }
        JSON
      end
      before do
        allow(LANGCHAIN_OPENAI).to receive(:chat).and_return(
          double(completion: valid_llm_response_json)
        )
      end
      it 'formats and calls the LLM with the prompt' do
        expect(subject).to receive(:format_rubric_categories).with(question).and_call_original
        expect(LANGCHAIN_OPENAI).to receive(:chat).with(
          hash_including(
            messages: array_including(
              hash_including(role: 'system'),
              hash_including(role: 'user')
            ),
            response_format: { type: 'json_object' }
          )
        ).and_return(double(completion: valid_llm_response_json))
        subject.evaluate(question, answer)
      end
      it 'returns parsed LLM response' do
        expect(subject).to receive(:parse_llm_response).and_call_original
        result = subject.evaluate(question, answer)
        expect(result).to be_a(Hash)
        expect(result['category_grades']).to be_an(Array)
        expect(result['category_grades'].first['category_id']).to eq(category.id)
        expect(result['overall_feedback']).to eq('overall feedback')
      end
    end

    describe '#format_rubric_categories' do
      it 'formats categories and criteria correctly' do
        result = subject.format_rubric_categories(question)
        expect(result).to include("Category ID: #{category.id}")
        expect(result).to include("Name: #{category.name}")
        expect(result).to include("Grade: #{criterion.grade}")
        expect(result).to include("Criterion ID: #{criterion.id}")
        expect(result).to include(criterion.explanation)
      end
    end

    describe '#parse_llm_response' do
      let(:parser) { subject.class.output_parser }
      let(:valid_json) do
        <<~JSON
          {
            "category_grades": [
              {
                "category_id": #{category.id},
                "criterion_id": #{criterion.id},
                "explanation": "selection explanation"
              }
            ],
            "overall_feedback": "overall feedback"
          }
        JSON
      end
      let(:invalid_json) { '{ "category_grades": [{ "missing": "closing bracket" }' }
      let(:fix_parser) { instance_double(Langchain::OutputParsers::OutputFixingParser) }
      context 'with valid JSON' do
        it 'returns the parsed output' do
          result = subject.parse_llm_response(valid_json)
          expect(result).to eq(JSON.parse(valid_json))
        end
      end
      context 'with invalid JSON' do
        before do
          allow_any_instance_of(Langchain::OutputParsers::OutputFixingParser).to receive(:parse).with(invalid_json).
            and_return(JSON.parse(valid_json))
        end
        it 'attempts to fix and parse the response' do
          result = subject.parse_llm_response(invalid_json)
          expect(result).to eq(JSON.parse(valid_json))
        end
      end
    end
  end
end
