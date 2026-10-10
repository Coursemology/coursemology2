# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::RubricBasedResponsesController, type: :controller do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:rubric_based_response_question) { nil }
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }
    let(:assessment) { create(:assessment, course: course) }

    before do
      controller_sign_in(controller, user)
      next unless rubric_based_response_question

      controller.instance_variable_set(:@rubric_based_response_question, rubric_based_response_question)
    end

    # The rubric fields of the edit form, as it submits them for +rubric+ unchanged.
    def rubric_form_params(rubric)
      {
        ai_grading_custom_prompt: rubric.grading_prompt,
        ai_grading_model_answer: rubric.model_answer,
        categories_attributes: indexed(rubric.categories.map { |category| category_form_params(category) })
      }
    end

    def category_form_params(category)
      criterions = category.criterions.map do |criterion|
        { id: criterion.id, grade: criterion.grade, explanation: criterion.explanation }
      end
      { id: category.id, name: category.name, criterions_attributes: indexed(criterions) }
    end

    # Nested-attributes params are keyed by index: { '0' => ..., '1' => ... }.
    def indexed(items)
      items.each_with_index.to_h { |item, i| [i.to_s, item] }
    end

    let(:new_category_params) do
      { name: 'New Category',
        criterions_attributes: { '0' => { grade: 0, explanation: '' }, '1' => { grade: 1, explanation: '' } } }
    end

    describe '#create' do
      def post_create(rubric_params)
        post :create, params: {
          course_id: course, assessment_id: assessment,
          question_rubric_based_response: { title: 'Essay', maximum_grade: 1,
                                            question_assessment: { skill_ids: [''] } }.merge(rubric_params)
        }
      end

      it 'builds the v2 active rubric from the params, without writing v1 rubric rows' do
        expect do
          post_create(ai_grading_custom_prompt: 'Grade it', categories_attributes: { '0' => new_category_params })
        end.to change(Course::Rubric, :count).by(1).
          and(not_change(Course::Assessment::Question::RubricBasedResponseCategory, :count))

        question = Course::Assessment::Question::RubricBasedResponse.last
        expect(question.active_rubric.categories.map(&:name)).to eq(['New Category'])
        expect(question.active_rubric.grading_prompt).to eq('Grade it')
        expect(question.active_rubric.questions).to include(question.acting_as)
      end

      it "rejects an invalid rubric with the rubric's message" do
        post_create(categories_attributes: {})

        expect(response).to have_http_status(:bad_request)
        expect(response.parsed_body['errors']).to include('at_least_one_category')
      end
    end

    describe '#edit' do
      render_views

      let!(:rubric_based_response_question) do
        create(:course_assessment_question_rubric_based_response, assessment: assessment)
      end

      it 'reads the rubric from the v2 active rubric, ignoring deprecated v1 rows' do
        Course::Assessment::Question::RubricBasedResponseCategory.create!(question: rubric_based_response_question,
                                                                          name: 'Legacy')

        get :edit, as: :json, params: { course_id: course, assessment_id: assessment,
                                        id: rubric_based_response_question }

        active_rubric = rubric_based_response_question.active_rubric
        expect(response.parsed_body['categories'].map { |category| category['name'] }).
          to eq(active_rubric.categories.map(&:name))
        expect(response.parsed_body['aiGradingCustomPrompt']).to eq(active_rubric.grading_prompt)
      end
    end

    describe '#update' do
      let!(:rubric_based_response_question) do
        create(:course_assessment_question_rubric_based_response, assessment: assessment)
      end
      let(:active_rubric) { rubric_based_response_question.active_rubric }

      def patch_update(question_params, confirm: nil)
        params = {
          course_id: course, assessment_id: assessment, id: rubric_based_response_question,
          question_rubric_based_response: rubric_form_params(active_rubric).
                                          merge(question_assessment: { skill_ids: [''] }).merge(question_params)
        }
        params[:confirm_rubric_advance] = confirm unless confirm.nil?
        patch :update, params: params
      end

      def params_with_new_category
        categories = rubric_form_params(active_rubric)[:categories_attributes]
        { categories_attributes: categories.merge(categories.size.to_s => new_category_params) }
      end

      context 'when adding a new category' do
        it 'versions the active rubric with the new category, without writing v1 rubric rows' do
          original_active_id = rubric_based_response_question.active_rubric_id

          expect { patch_update(params_with_new_category) }.
            not_to change(Course::Assessment::Question::RubricBasedResponseCategory, :count)

          reloaded = rubric_based_response_question.reload
          expect(reloaded.active_rubric_id).not_to eq(original_active_id)
          expect(reloaded.active_rubric.categories.map(&:name)).to include('New Category')
        end
      end

      it 'does not create a new rubric version when the content is unchanged' do
        expect { patch_update({}) }.not_to change(Course::Rubric, :count)
      end

      it 'creates a new version and repoints active_rubric_id when the grading prompt changes' do
        original_active_id = rubric_based_response_question.active_rubric_id

        expect { patch_update({ ai_grading_custom_prompt: 'A brand new grading prompt' }) }.
          to change(Course::Rubric, :count).by(1)

        reloaded = rubric_based_response_question.reload
        expect(reloaded.active_rubric_id).not_to eq(original_active_id)
        expect(reloaded.active_rubric.grading_prompt).to eq('A brand new grading prompt')
      end

      context 'when an incompatible change has graded answers' do
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

        it 'rolls back and asks for confirmation (nothing saved) when not confirmed' do
          original_active_id = rubric_based_response_question.active_rubric_id
          patch_update(params_with_new_category, confirm: false)

          expect(response).to have_http_status(:conflict)
          expect(response.parsed_body['error']).to eq('rubric_advance_confirmation_required')
          reloaded = rubric_based_response_question.reload
          expect(reloaded.active_rubric_id).to eq(original_active_id)
          expect(reloaded.active_rubric.categories.map(&:name)).not_to include('New Category')
          expect(grading.reload.rubric_id).to eq(original_active_id)
        end

        it 'saves the change and advances the grading selections when confirmed' do
          original_rubric_id = grading.rubric_id
          patch_update(params_with_new_category, confirm: true)

          reloaded = rubric_based_response_question.reload
          expect(reloaded.active_rubric.categories.map(&:name)).to include('New Category')
          # rubric_id is immutable through advance (flags the grade as stale); only the selections move to
          # the new rubric so the breakdown stays displayable against the active rubric.
          expect(grading.reload.rubric_id).to eq(original_rubric_id)
          selection_rubric_ids = grading.selections.map { |selection| selection.category.rubric_id }.uniq
          expect(selection_rubric_ids).to eq([reloaded.active_rubric_id])
        end
      end

      context 'when lowering the maximum grade' do
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
          patch_update({ maximum_grade: new_maximum })

          expect(answer.reload.grade).to eq(new_maximum)
        end
      end
    end

    describe '#destroy' do
      let!(:rubric_based_response_question) do
        create(:course_assessment_question_rubric_based_response, assessment: assessment)
      end
      let(:active_rubric) { rubric_based_response_question.active_rubric }
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

      def destroy_question
        delete :destroy, params: {
          course_id: course, assessment_id: assessment, id: rubric_based_response_question
        }
      end

      it 'destroys the question, its now-orphaned rubric, and the rubric evaluations (no orphans)' do
        rubric_id = active_rubric.id
        evaluation_id = grading.id

        destroy_question

        expect(response).to have_http_status(:ok)
        expect(Course::Rubric.exists?(rubric_id)).to be(false)
        expect(Course::Rubric::Category.where(rubric_id: rubric_id)).to be_empty
        expect(Course::Rubric::AnswerEvaluation.exists?(evaluation_id)).to be(false)
        expect(Course::Assessment::Question::QuestionRubric.where(rubric_id: rubric_id)).to be_empty
      end

      it 'also removes any deprecated v1 rubric rows of a legacy question' do
        category = Course::Assessment::Question::RubricBasedResponseCategory.create!(
          question: rubric_based_response_question, name: 'Legacy'
        )
        Course::Assessment::Question::RubricBasedResponseCriterion.create!(category: category, grade: 0,
                                                                           explanation: '')

        destroy_question

        expect(response).to have_http_status(:ok)
        expect(Course::Assessment::Question::RubricBasedResponseCategory.exists?(category.id)).to be(false)
      end
    end
  end
end
