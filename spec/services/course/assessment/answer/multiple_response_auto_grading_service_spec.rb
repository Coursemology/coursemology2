require 'rails_helper'

RSpec.describe Course::Assessment::Answer::MultipleResponseAutoGradingService do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:answer) do
      create(:course_assessment_answer_multiple_response, :submitted, *answer_traits).answer
    end
    let(:question) { answer.question.actable }
    let(:answer_traits) { nil }
    let(:grading) do
      create(:course_assessment_answer_auto_grading, answer: answer)
    end

    describe '#grade' do
      it 'sets the grading as graded' do
        expect(subject.grade(grading)).to eq(true)
        expect(grading.graded?).to eq(true)
        expect(answer.graded?).to eq(true)
      end

      context 'when the question is requires all correct options' do
        context 'when the correct answer is given' do
          let(:answer_traits) { :correct }

          it 'marks the answer correct' do
            subject.grade(grading)
            expect(answer.grade).to eq(question.maximum_grade)
            expect(grading.result['messages']).to \
              contain_exactly(question.options.correct.first.explanation)
          end
        end

        context 'when the wrong answer is given' do
          let(:answer_traits) { :wrong }

          it 'marks the answer wrong' do
            subject.grade(grading)
            expect(answer.grade).to eq(0)
            expect(grading.result['messages']).to \
              contain_exactly(answer.specific.options.first.explanation)
          end
        end
      end

      context 'when a question is requires any correct option' do
        context 'when the correct answer is given' do
          let(:answer_traits) { :correct }

          it 'marks the answer correct' do
            subject.grade(grading)
            expect(answer.grade).to eq(question.maximum_grade)
            expect(grading.result['messages']).to \
              contain_exactly(question.options.correct.first.explanation)
          end
        end

        context 'when the wrong answer is given' do
          let(:answer_traits) { :wrong }

          it 'marks the answer wrong' do
            subject.grade(grading)
            expect(answer.grade).to eq(0)
            expect(grading.result['messages']).to \
              contain_exactly(answer.specific.options.first.explanation)
          end
        end
      end
    end
  end
end
