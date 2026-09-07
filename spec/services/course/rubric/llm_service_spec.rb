# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Rubric::LlmService do
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
    let(:submission) do
      create(:submission, :attempting, assessment: assessment)
    end
    let(:answer) do
      create(:course_assessment_answer_rubric_based_response, :submitted,
             question: question.acting_as, submission: submission).answer.actable
    end

    let(:question_adapter) { Course::Assessment::Question::QuestionAdapter.new(question.acting_as) }
    let(:rubric_adapter) { Course::Rubric::RubricAdapter.new(active_rubric) }
    let(:answer_adapter) do
      Course::Assessment::Answer::RubricBasedResponse::AnswerAdapter.new(answer, active_rubric)
    end
    let(:llm_adapter) { Course::Rubric::LlmService::LlmAdapter.for_course(assessment.course) }
    subject do
      Course::Rubric::LlmService.new(question_adapter, rubric_adapter, answer_adapter, llm_adapter)
    end

    describe '#evaluate' do
      it 'calls the LLM with the formatted prompt and returns the parsed LLM response' do
        result = subject.evaluate
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
        expect(result['feedback']).to include('Mock feedback')
      end

      it 'delegates the model call to the injected LLM adapter' do
        adapter = instance_double(Course::Rubric::LlmAdapter::Gpt5Point6LunaAdapter, system_prompt_override: nil)
        service = Course::Rubric::LlmService.new(question_adapter, rubric_adapter, answer_adapter, adapter)
        expect(adapter).to receive(:structured_completion).with(
          messages: an_instance_of(Array),
          schema: an_instance_of(Hash),
          schema_name: 'rubric_grading_response'
        ).and_return({ 'category_grades' => {}, 'feedback' => 'ok' })

        expect(service.evaluate['feedback']).to eq('ok')
      end
    end
  end
end
