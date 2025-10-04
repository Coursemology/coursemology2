# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::RubricAutoGradingService do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:assessment) { create(:assessment, :published_with_rubric_question) }
    let(:question) { assessment.questions.first.specific }
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
      context 'with valid LLM response' do
        let(:valid_response) do
          {
            'category_grades' => [
              {
                category_id: question.categories.first.id,
                criterion_id: question.categories.first.criterions.last.id,
                grade: question.categories.first.criterions.last.grade,
                explanation: '1st selection explanation'
              },
              {
                category_id: question.categories.second.id,
                criterion_id: question.categories.second.criterions.last.id,
                grade: question.categories.second.criterions.last.grade,
                explanation: '2nd selection explanation'
              }
            ],
            'feedback' => 'feedback'
          }
        end

        it 'instantiates LLM service and processes its response' do
          result = subject.send(:evaluate_answer, answer.actable)
          expect(result).to be_an(Array)
          expect(result.length).to eq(4) # [correct, grade, messages, feedback]
          expect(result[0]).to be true
          expect(result[1]).to be_between(0, question.maximum_grade).inclusive
          expect(result[2]).to contain_exactly('success')
          expect(result[3]).to include('Mock feedback')
        end
      end
    end
  end
end
