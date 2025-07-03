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
        category_grades = result['category_grades']
        expect(category_grades).to be_a(Array)
        categories.each do |category|
          category_grade = category_grades.find { |cg| cg[:category_id] == category.id }
          expect(category_grade).to be_present
          criterion = category.criterions.find { |c| c.id == category_grade[:criterion_id] }
          expect(criterion).to be_present
          expect(category_grade[:grade]).to eq(criterion.grade)
          expect(category_grade[:explanation]).to eq("Mock explanation for category_#{category.id}")
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
        category_fields = categories.map do |category|
          "\"category_#{category.id}\": {
            \"criterion_id_with_grade\":
              \"criterion_#{category.criterions.first.id}_grade_#{category.criterions.first.grade}\",
            \"explanation\": \"selection explanation\"
          }"
        end.join(',')

        <<~JSON
          {
            "category_grades": { #{category_fields} },
            "overall_feedback": "overall feedback"
          }
        JSON
      end
      let(:invalid_json) { '{ "category_grades": [{ "missing": "closing bracket" }' }

      let(:output_parser) do
        schema = subject.generate_dynamic_schema(question)
        Langchain::OutputParsers::StructuredOutputParser.from_json_schema(schema)
      end

      context 'with valid JSON' do
        it 'returns the parsed output' do
          result = subject.parse_llm_response(valid_json, output_parser)
          expect(result).to eq(JSON.parse(valid_json))
        end
      end
      context 'with invalid JSON' do
        it 'attempts to fix and parse the response' do
          result = subject.parse_llm_response(invalid_json, output_parser)
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
          expect(result['overall_feedback']).to be_a(String)
        end
      end
    end
  end
end
