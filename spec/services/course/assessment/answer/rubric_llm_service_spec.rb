# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::RubricLlmService do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:assessment) { create(:assessment, :published_with_rubric_question) }
    let(:question) { assessment.questions.first.specific }
    let(:categories) { question.categories.without_bonus_category.includes(:criterions) }
    let(:submission) do
      create(:submission, :attempting, assessment: assessment)
    end
    let(:answer) do
      create(:course_assessment_answer_rubric_based_response, :submitted,
             question: question.acting_as, submission: submission).answer.actable
    end

    describe '#evaluate' do
      it 'calls the LLM with the formatted prompt and returns the parsed LLM response' do
        expect(subject).to receive(:format_rubric_categories).with(question).and_call_original
        result = subject.evaluate(question, answer)
        expect(result).to be_a(Hash)
        expect(result['category_grades']).to be_an(Array)
        result['category_grades'].each do |grade|
          category = categories.find { |c| c.id == grade['category_id'] }
          expect(category).to be_present
          criterion = category.criterions.find { |c| c.id == grade['criterion_id'] }
          expect(criterion).to be_present
          expect(grade['explanation']).to include('Mock explanation for category')
        end
        expect(result['overall_feedback']).to include('Mock overall feedback')
      end
    end

    describe '#format_rubric_categories' do
      it 'formats categories and criteria correctly' do
        result = subject.format_rubric_categories(question)
        categories.each do |category|
          expect(result).to include("Category ID: #{category.id}")
          expect(result).to include("Name: #{category.name}")
          category.criterions.each do |criterion|
            expect(result).to include("Grade: #{criterion.grade}")
            expect(result).to include("Criterion ID: #{criterion.id}")
            expect(result).to include(criterion.explanation)
          end
        end
      end
    end

    describe '#parse_llm_response' do
      let(:valid_json) do
        <<~JSON
          {
            "category_grades": [
              {
                "category_id": #{categories.first.id},
                "criterion_id": #{categories.first.criterions.first.id},
                "explanation": "selection explanation"
              }
            ],
            "overall_feedback": "overall feedback"
          }
        JSON
      end
      let(:invalid_json) { '{ "category_grades": [{ "missing": "closing bracket" }' }
      context 'with valid JSON' do
        it 'returns the parsed output' do
          result = subject.parse_llm_response(valid_json)
          expect(result).to eq(JSON.parse(valid_json))
        end
      end
      context 'with invalid JSON' do
        it 'attempts to fix and parse the response' do
          result = subject.parse_llm_response(invalid_json)
          expect(result['category_grades']).to be_an(Array)
          result['category_grades'].each do |grade|
            expect(grade['category_id']).to be_a(Integer)
            expect(grade['criterion_id']).to be_a(Integer)
            expect(grade['explanation']).to be_a(String)
          end
          expect(result['overall_feedback']).to be_a(String)
        end
      end
    end
  end
end
