# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::RubricAutoGradingService do
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
    let(:submission) do
      create(:submission, :attempting, assessment: assessment)
    end
    let(:answer) do
      create(:course_assessment_answer_rubric_based_response, :submitted,
             question: question.acting_as, submission: submission).answer
    end
    let!(:grading) do
      create(:course_assessment_answer_auto_grading, answer: answer)
    end

    describe '#grade' do
      before do
        allow(answer.submission.assessment).to receive(:autograded?).and_return(true)
      end
      context 'when the question is rubric-based' do
        it 'always grades the answer as correct' do
          subject.grade(answer)
          expect(answer).to be_correct
          expect(answer.grade).to be_between(0, question.maximum_grade).inclusive
          expect(grading.result['messages']).to contain_exactly('success')
        end
      end
    end

    describe '#evaluate' do
      it 'evaluates the answer' do
        result = subject.evaluate(answer)
        expect(result).to be_between(0, question.maximum_grade).inclusive
        expect(answer.auto_grading.result).to eq({ 'messages' => ['success'] })
      end
    end

    describe '#evaluate_answer' do
      it 'instantiates LLM service and processes its response' do
        result = subject.send(:evaluate_answer, answer.actable)
        expect(result).to be_an(Array)
        expect(result.length).to eq(4) # [correct, grade, messages, feedback]
        expect(result[0]).to be true
        expect(result[1]).to be_between(0, question.maximum_grade).inclusive
        expect(result[2]).to contain_exactly('success')
        expect(result[3]).to include('Mock feedback')
      end

      it 'records a v2 grading evaluation (and an llm evaluation) against the active rubric' do
        result = subject.send(:evaluate_answer, answer.actable)

        grading = answer.reload.grading_rubric_evaluation
        expect(grading).to be_present
        expect(grading.rubric).to eq(active_rubric)
        expect(grading.selections.map(&:category_id)).to match_array(active_rubric.categories.map(&:id))
        # Auto-grading records a (hidden) playground evaluation so it does not surface in the playground.
        expect(answer.rubric_evaluations.playground_types.where(rubric: active_rubric)).to exist
        expect(answer.rubric_evaluations.playground.where(rubric: active_rubric)).not_to exist

        # The returned grade matches the sum of the selected criterions in the grading evaluation.
        expected_grade = grading.selections.includes(:criterion).sum { |selection| selection.criterion&.grade.to_i }
        expect(result[1]).to eq(expected_grade)
      end
    end
  end
end
