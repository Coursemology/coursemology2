# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::RubricsController, type: :controller do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }
    let(:assessment) { create(:assessment, course: course) }
    let(:question) { create(:course_assessment_question_rubric_based_response, assessment: assessment) }
    let!(:rubric) do
      create(:course_rubric, course: course).tap do |r|
        r.question_rubrics.create!(question: question.acting_as)
      end
    end

    before { controller_sign_in(controller, user) }

    def delete_rubric(target = rubric)
      # The rubrics resources are declared with `on: :member`, which bakes that into the route params.
      delete :destroy, params: {
        course_id: course.id, assessment_id: assessment.id,
        question_id: question.acting_as.id, id: target.id, on: :member
      }
    end

    describe '#destroy' do
      context 'when the rubric is the question\'s active rubric' do
        before { question.acting_as.update_column(:active_rubric_id, rubric.id) }

        it 'rejects the deletion and leaves the rubric and its link intact' do
          expect { delete_rubric }.not_to change(Course::Rubric, :count)
          expect(response).to have_http_status(:unprocessable_entity)
          expect(question.acting_as.reload.rubrics).to include(rubric)
        end
      end

      context 'when the rubric has no evaluations and is attached to no other question' do
        it 'deletes the rubric and its link' do
          expect { delete_rubric }.to change(Course::Rubric, :count).by(-1)
          expect(response).to have_http_status(:ok)
          expect(Course::Assessment::Question::QuestionRubric.where(rubric_id: rubric.id)).to be_empty
        end
      end

      context 'when the rubric is also attached to another question and has no evaluations here' do
        let(:other_question) { create(:course_assessment_question_rubric_based_response, assessment: assessment) }

        before { rubric.question_rubrics.create!(question: other_question.acting_as) }

        it 'only unlinks this question, keeping the rubric and the other link' do
          expect { delete_rubric }.not_to change(Course::Rubric, :count)
          expect(response).to have_http_status(:ok)
          expect(question.acting_as.reload.rubrics).not_to include(rubric)
          expect(other_question.acting_as.reload.rubrics).to include(rubric)
        end
      end

      context 'when this question\'s answers have evaluations against the rubric' do
        let(:submission) { create(:submission, assessment: assessment, creator: user) }
        let(:answer) do
          create(:course_assessment_answer_rubric_based_response, :submitted,
                 question: question.acting_as, submission: submission).answer
        end
        let!(:playground_evaluation) do
          Course::Rubric::AnswerEvaluation.create!(answer: answer, rubric: rubric, evaluation_type: :playground)
        end
        let!(:grading_evaluation) do
          Course::Rubric::AnswerEvaluation.create!(answer: answer, rubric: rubric, evaluation_type: :grading)
        end

        it 'unlinks the question, keeps the rubric, hides playground evaluations, and keeps grading ones' do
          expect { delete_rubric }.not_to change(Course::Rubric, :count)
          expect(response).to have_http_status(:ok)
          expect(question.acting_as.reload.rubrics).not_to include(rubric)
          expect(playground_evaluation.reload.evaluation_type).to eq('playground_hidden')
          expect(grading_evaluation.reload).to be_present
        end
      end
    end

    describe '#set_active' do
      # A structurally incompatible second rubric (3 categories vs the active rubric's 2), linked to the question.
      let(:other_rubric) do
        create(:course_rubric, course: course, category_count: 3).tap do |r|
          r.question_rubrics.create!(question: question.acting_as)
        end
      end

      before { question.acting_as.update_column(:active_rubric_id, rubric.id) }

      def set_active(target = other_rubric, confirm: nil)
        params = {
          course_id: course.id, assessment_id: assessment.id,
          question_id: question.acting_as.id, id: target.id, on: :member
        }
        params[:confirm_rubric_advance] = confirm unless confirm.nil?
        post :set_active, params: params
      end

      context 'when there are no graded answers to advance' do
        it 'repoints the active rubric' do
          set_active
          expect(response).to have_http_status(:ok)
          expect(question.acting_as.reload.active_rubric_id).to eq(other_rubric.id)
        end
      end

      context 'when an incompatible change would advance graded answers' do
        let(:submission) { create(:submission, assessment: assessment, creator: user) }
        let(:answer) do
          create(:course_assessment_answer_rubric_based_response, :submitted,
                 question: question.acting_as, submission: submission).answer
        end
        let!(:grading) do
          evaluation = Course::Rubric::AnswerEvaluation.create!(
            answer: answer, rubric: rubric, evaluation_type: :grading
          )
          rubric.categories.each { |category| evaluation.selections.create!(category_id: category.id) }
          evaluation
        end

        it 'rolls back and asks for confirmation when not confirmed' do
          set_active
          expect(response).to have_http_status(:conflict)
          expect(response.parsed_body['error']).to eq('rubric_advance_confirmation_required')
          expect(question.acting_as.reload.active_rubric_id).to eq(rubric.id)
        end

        it 'repoints and advances the grading selections when confirmed' do
          set_active(confirm: true)
          expect(response).to have_http_status(:ok)
          expect(question.acting_as.reload.active_rubric_id).to eq(other_rubric.id)
          selection_rubric_ids = grading.reload.selections.map { |selection| selection.category.rubric_id }.uniq
          expect(selection_rubric_ids).to eq([other_rubric.id])
        end
      end
    end
  end
end
