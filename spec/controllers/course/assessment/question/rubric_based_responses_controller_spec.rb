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

        it 'updates the question with the new category' do
          subject
          expect(rubric_based_response_question.reload.categories.map(&:name)).to include('New Category')
        end

        it 'syncs the v2 active rubric to mirror the updated question' do
          subject
          active = rubric_based_response_question.reload.active_rubric
          expect(active).to be_present
          expect(active.categories.map(&:name)).
            to match_array(rubric_based_response_question.categories.without_bonus_category.map(&:name))
        end
      end

      context 'when an up-to-date active rubric already exists' do
        let!(:rubric_based_response_question) do
          create(:course_assessment_question_rubric_based_response, assessment: assessment)
        end

        before do
          rubric = Course::Rubric.build_from_v1(rubric_based_response_question, course).tap(&:save!)
          rubric_based_response_question.acting_as.update_column(:active_rubric_id, rubric.id)
        end

        def patch_update(question_params)
          patch :update, params: {
            course_id: course, assessment_id: assessment, id: rubric_based_response_question,
            question_rubric_based_response: question_params.reverse_merge(question_assessment: { skill_ids: [''] })
          }
        end

        it 'does not create a new rubric version when the content is unchanged' do
          expect do
            patch_update(ai_grading_model_answer: rubric_based_response_question.ai_grading_model_answer)
          end.not_to change(Course::Rubric, :count)
        end

        it 'creates a new version and repoints active_rubric_id when the grading prompt changes' do
          original_active_id = rubric_based_response_question.active_rubric_id

          expect { patch_update(ai_grading_custom_prompt: 'A brand new grading prompt') }.
            to change(Course::Rubric, :count).by(1)

          reloaded = rubric_based_response_question.reload
          expect(reloaded.active_rubric_id).not_to eq(original_active_id)
          expect(reloaded.active_rubric.grading_prompt).to eq('A brand new grading prompt')
        end
      end

      context 'when an incompatible change has graded answers' do
        let!(:rubric_based_response_question) do
          create(:course_assessment_question_rubric_based_response, assessment: assessment)
        end
        let!(:active_rubric) do
          Course::Rubric.build_from_v1(rubric_based_response_question, course).tap do |rubric|
            rubric.save!
            rubric_based_response_question.acting_as.update_column(:active_rubric_id, rubric.id)
          end
        end
        let!(:submission) { create(:submission, assessment: assessment, creator: user) }
        let!(:answer) do
          answer = rubric_based_response_question.attempt(submission)
          answer.finalise!
          answer.save!
          answer
        end
        let!(:grading) do
          evaluation = Course::Rubric::AnswerEvaluation.create!(
            answer: answer, rubric: active_rubric, evaluation_type: :grading
          )
          active_rubric.categories.each { |category| evaluation.selections.create!(category_id: category.id) }
          evaluation
        end

        def patch_add_category(confirm:)
          patch :update, params: {
            course_id: course, assessment_id: assessment, id: rubric_based_response_question,
            confirm_rubric_advance: confirm,
            question_rubric_based_response: {
              question_assessment: { skill_ids: [''] },
              categories_attributes: {
                '0' => { name: 'Brand New Category',
                         criterions_attributes: { '0' => { grade: 0, explanation: '' },
                                                  '1' => { grade: 1, explanation: '' } } }
              }
            }
          }
        end

        it 'rolls back and asks for confirmation (nothing saved) when not confirmed' do
          original_active_id = rubric_based_response_question.active_rubric_id
          patch_add_category(confirm: false)

          expect(response).to have_http_status(:conflict)
          expect(response.parsed_body['error']).to eq('rubric_advance_confirmation_required')
          reloaded = rubric_based_response_question.reload
          expect(reloaded.categories.map(&:name)).not_to include('Brand New Category')
          expect(reloaded.active_rubric_id).to eq(original_active_id)
          expect(grading.reload.rubric_id).to eq(original_active_id)
        end

        it 'saves the change and advances the grading selections when confirmed' do
          original_rubric_id = grading.rubric_id
          patch_add_category(confirm: true)

          reloaded = rubric_based_response_question.reload
          expect(reloaded.categories.map(&:name)).to include('Brand New Category')
          # rubric_id is immutable through advance (flags the grade as stale); only the selections move to
          # the new rubric so the breakdown stays displayable against the active rubric.
          expect(grading.reload.rubric_id).to eq(original_rubric_id)
          selection_rubric_ids = grading.selections.map { |selection| selection.category.rubric_id }.uniq
          expect(selection_rubric_ids).to eq([reloaded.active_rubric_id])
        end
      end

      context 'when lowering the maximum grade' do
        let!(:rubric_based_response_question) do
          create(:course_assessment_question_rubric_based_response, assessment: assessment)
        end
        let!(:submission) { create(:submission, assessment: assessment, creator: user) }
        let!(:answer) do
          answer = rubric_based_response_question.attempt(submission)
          answer.finalise!
          answer.save!
          answer.update_column(:grade, rubric_based_response_question.maximum_grade)
          answer
        end

        it 'clamps existing answer grades above the new maximum' do
          new_maximum = rubric_based_response_question.maximum_grade - 1
          patch :update, params: {
            course_id: course, assessment_id: assessment, id: rubric_based_response_question,
            question_rubric_based_response: { maximum_grade: new_maximum,
                                              question_assessment: { skill_ids: [''] } }
          }

          expect(answer.reload.grade).to eq(new_maximum)
        end
      end
    end

    describe '#destroy' do
      let!(:rubric_based_response_question) do
        create(:course_assessment_question_rubric_based_response, assessment: assessment)
      end
      let!(:active_rubric) do
        Course::Rubric.build_from_v1(rubric_based_response_question, course).tap do |rubric|
          rubric.save!
          rubric_based_response_question.acting_as.update_column(:active_rubric_id, rubric.id)
        end
      end
      let!(:submission) { create(:submission, assessment: assessment, creator: user) }
      let!(:answer) do
        answer = rubric_based_response_question.attempt(submission)
        answer.finalise!
        answer.save!
        answer
      end
      let!(:grading) do
        evaluation = Course::Rubric::AnswerEvaluation.create!(
          answer: answer, rubric: active_rubric, evaluation_type: :grading
        )
        active_rubric.categories.each { |category| evaluation.selections.create!(category_id: category.id) }
        evaluation
      end

      it 'destroys the question, its now-orphaned rubric, and the rubric evaluations (no orphans)' do
        rubric_id = active_rubric.id
        evaluation_id = grading.id

        delete :destroy, params: {
          course_id: course, assessment_id: assessment, id: rubric_based_response_question
        }

        expect(response).to have_http_status(:ok)
        expect(Course::Rubric.exists?(rubric_id)).to be(false)
        expect(Course::Rubric::Category.where(rubric_id: rubric_id)).to be_empty
        expect(Course::Rubric::AnswerEvaluation.exists?(evaluation_id)).to be(false)
        expect(Course::Assessment::Question::QuestionRubric.where(rubric_id: rubric_id)).to be_empty
      end
    end
  end
end
