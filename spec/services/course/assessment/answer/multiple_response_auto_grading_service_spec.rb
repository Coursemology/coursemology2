# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::MultipleResponseAutoGradingService do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:answer) do
      arguments = *answer_traits
      options = arguments.extract_options!
      options[:question_traits] = question_traits
      options[:submission_traits] = submission_traits
      create(:course_assessment_answer_multiple_response, :submitted, *arguments, options).answer
    end
    let(:question) { answer.question.actable }
    let(:question_traits) { nil }
    let(:submission_traits) { [{ auto_grade: false }] }
    let(:answer_traits) { nil }
    let(:grading) do
      create(:course_assessment_answer_auto_grading, answer: answer)
    end

    describe '#grade' do
      context 'when the question is requires all correct options' do
        context 'when the correct answer is given' do
          let(:answer_traits) { :correct }

          it 'marks the answer correct' do
            subject.grade(grading)
            expect(answer.grade).to eq(question.maximum_grade)
            expect(answer).to be_correct
            expect(grading.result['messages']).to \
              contain_exactly(question.options.correct.first.explanation)
          end
        end

        context 'when the wrong answer is given' do
          let(:answer_traits) { :wrong }

          it 'marks the answer wrong' do
            subject.grade(grading)
            expect(answer).not_to be_correct
            expect(answer.grade).to eq(0)
            expect(grading.result['messages']).to \
              contain_exactly(answer.specific.options.first.explanation)
          end
        end
      end

      context 'when a question is requires any correct option' do
        let(:question_traits) { :any_correct }

        context 'when the correct answer is given' do
          let(:answer_traits) { :correct }

          it 'marks the answer correct' do
            subject.grade(grading)
            expect(answer).to be_correct
            expect(answer.grade).to eq(question.maximum_grade)
            expect(grading.result['messages']).to \
              contain_exactly(question.options.correct.first.explanation)
          end
        end

        context 'when the wrong answer is given' do
          let(:answer_traits) { :wrong }

          it 'marks the answer wrong' do
            subject.grade(grading)
            expect(answer).not_to be_correct
            expect(answer.grade).to eq(0)
            expect(grading.result['messages']).to \
              contain_exactly(*answer.specific.options.reject(&:correct).map(&:explanation))
          end
        end
      end
    end
  end
end
