# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::RubricBasedResponsesController, type: :controller do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:rubric_based_response_question) { nil }
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }
    let(:assessment) { create(:assessment, course: course) }
    let(:immutable_rubric_based_response_question) do
      create(:course_assessment_question_rubric_based_response, assessment: assessment).tap do |question|
        allow(question).to receive(:save).and_return(false)
        allow(question).to receive(:destroy).and_return(false)
      end
    end

    before do
      controller_sign_in(controller, user)
      return unless rubric_based_response_question

      controller.instance_variable_set(:@rubric_based_response_question, rubric_based_response_question)
    end

    describe '#update' do
      context 'when adding a new category' do
        let!(:rubric_based_response_question) do
          create(:course_assessment_question_rubric_based_response, assessment: assessment)
        end
        let!(:submission) do
          create(:submission, assessment: assessment, creator: user)
        end
        let!(:answer) do
          answer = rubric_based_response_question.attempt(submission)
          answer.finalise!
          answer.save!
          answer
        end

        subject do
          question_params = {
            maximum_grade: rubric_based_response_question.maximum_grade + 1,
            question_assessment: { skill_ids: [''] },
            categories_attributes: {
              '0' => {
                name: 'New Category',
                criterions_attributes: {
                  '0' => {
                    grade: 0,
                    explanation: nil
                  },
                  '1' => {
                    grade: 1,
                    explanation: nil
                  }
                }
              }
            }
          }
          patch :update, params: {
            course_id: course, assessment_id: assessment, id: rubric_based_response_question,
            question_rubric_based_response: question_params
          }
        end

        it 'creates new selections for existing answers' do
          selection_count_before = Course::Assessment::Answer::RubricBasedResponseSelection.count
          subject
          selection_count_after = Course::Assessment::Answer::RubricBasedResponseSelection.count
          expect(selection_count_after).to eq(selection_count_before + 1)

          new_category = rubric_based_response_question.reload.categories.find_by(name: 'New Category')
          new_selection = Course::Assessment::Answer::RubricBasedResponseSelection.find_by(
            answer_id: answer.actable.id,
            category_id: new_category.id
          )
          expect(new_selection).not_to be_nil
        end

        it 'updates the question with the new category' do
          subject
          expect(rubric_based_response_question.reload.categories.map(&:name)).to include('New Category')
        end
      end
    end
  end
end
