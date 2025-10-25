# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::RubricBasedResponse::AnswerAdapter do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:assessment) { create(:assessment, :published_with_rubric_question) }
    let(:question) { assessment.questions.first.specific }
    let(:submission) do
      create(:submission, :attempting, assessment: assessment)
    end
    let(:answer) do
      create(:course_assessment_answer_rubric_based_response, :submitted,
             question: question.acting_as, submission: submission)
    end
    let!(:grading) do
      create(:course_assessment_answer_auto_grading, answer: answer)
    end

    subject { Course::Assessment::Answer::RubricBasedResponse::AnswerAdapter.new(answer) }

    describe '#update_answer_selections' do
      let(:category_grades) do
        [
          {
            category_id: question.categories.first.id,
            criterion_id: question.categories.first.criterions.first.id,
            grade: question.categories.first.criterions.first.grade,
            explanation: 'selection explanation'
          }
        ]
      end
      context 'when answer selections do not exist' do
        before do
          allow(answer.actable).to receive(:selections).and_return([])
        end
        it 'creates category grade instances' do
          expect(answer.actable).to receive(:create_category_grade_instances)
          expect(answer.actable).to receive(:reload)
          subject.send(:update_answer_selections, answer.actable, category_grades)
        end
      end
      context 'when answer selections exist' do
        let(:selection) do
          build_stubbed(:course_assessment_answer_rubric_based_response_selection,
                        category_id: question.categories.first.id)
        end
        before do
          allow(answer.actable).to receive(:selections).and_return([selection])
        end
        it 'assigns parameters to existing selections' do
          expect(answer.actable).to receive(:assign_params).with(
            hash_including(selections_attributes: array_including(
              hash_including(
                id: selection.id,
                criterion_id: question.categories.first.criterions.first.id,
                grade: question.categories.first.criterions.first.grade,
                explanation: 'selection explanation'
              )
            ))
          )
          subject.send(:update_answer_selections, answer.actable, category_grades)
        end
      end
    end

    describe '#update_answer_grade' do
      let(:category_grades) do
        [
          {
            category_id: question.categories.first.id,
            criterion_id: question.categories.first.criterions.first.id,
            grade: question.categories.first.criterions.last.grade,
            explanation: '1st selection explanation'
          },
          {
            category_id: question.categories.second.id,
            criterion_id: question.categories.second.criterions.first.id,
            grade: question.categories.second.criterions.last.grade,
            explanation: '2nd selection explanation'
          }
        ]
      end
      it 'updates the answer grade based on category grades' do
        subject.send(:update_answer_selections, answer.actable, category_grades)
        total_grade = subject.send(:update_answer_grade, answer.actable, category_grades)
        expect(total_grade).to eq(
          question.categories.first.criterions.last.grade +
          question.categories.second.criterions.last.grade
        )
        expect(answer.actable.grade).to eq(total_grade)
      end
    end
  end
end
