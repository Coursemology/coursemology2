# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::ForumPostResponsesController, type: :controller do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:forum_post_response) { nil }
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }
    let(:assessment) { create(:assessment, course: course) }
    let(:immutable_forum_post_response_question) do
      create(:course_assessment_question_forum_post_response, assessment: assessment).tap do |question|
        allow(question).to receive(:save).and_return(false)
        allow(question).to receive(:destroy).and_return(false)
      end
    end

    before do
      controller_sign_in(controller, user)
      next unless forum_post_response

      controller.instance_variable_set(:@forum_post_response_question, forum_post_response)
    end

    describe '#create' do
      subject do
        question_forum_post_response_attributes =
          attributes_for(:course_assessment_question_forum_post_response).
          slice(:description, :maximum_grade, :has_text_response, :max_posts)
        post :create, params: {
          course_id: course, assessment_id: assessment,
          question_forum_post_response: question_forum_post_response_attributes
        }
      end

      context 'when saving fails' do
        let(:forum_post_response) { immutable_forum_post_response_question }

        it do
          is_expected.to have_http_status(:bad_request)
          expect(JSON.parse(response.body)['errors']).not_to be_nil
        end
      end

      context 'when creating with rubric grading mode' do
        let(:categories_attributes) do
          {
            '0' => {
              name: 'Clarity',
              criterions_attributes: {
                '0' => { grade: 0, explanation: 'Poor' },
                '1' => { grade: 2, explanation: 'Great' }
              }
            }
          }
        end

        def post_create(extra)
          attrs = attributes_for(:course_assessment_question_forum_post_response).
                  slice(:description, :maximum_grade, :has_text_response, :max_posts).
                  merge(grading_mode: 'rubric').merge(extra)
          post :create, params: {
            course_id: course, assessment_id: assessment, question_forum_post_response: attrs
          }
        end

        it 'builds a valid active rubric and sets the grading mode to rubric' do
          expect { post_create(categories_attributes: categories_attributes) }.
            to change(Course::Rubric, :count).by(1)

          question = Course::Assessment::Question::ForumPostResponse.last
          expect(question.grading_mode).to eq('rubric')
          expect(question.active_rubric).to be_present
          expect(question.active_rubric.categories.map(&:name)).to include('Clarity')
        end

        it 'derives the maximum grade from the rubric total, ignoring the submitted value' do
          # Rubric total for the single "Clarity" category is its top criterion grade (2). The submitted
          # maximum_grade (from attributes_for) is overridden by this derived value.
          post_create(categories_attributes: categories_attributes)

          expect(Course::Assessment::Question::ForumPostResponse.last.maximum_grade).to eq(2)
        end

        it 'rejects rubric grading mode without a valid rubric' do
          post_create(categories_attributes: {})

          expect(response).to have_http_status(:bad_request)
        end

        it 'persists the given grading contexts' do
          sibling = create(:course_assessment_question_text_response, assessment: assessment)
          post_create(
            categories_attributes: categories_attributes,
            grading_contexts: [
              { context_type: 'sibling_question_answer', source_id: sibling.acting_as.id, identifier: 'peer_answer' },
              { context_type: 'forum_thread', identifier: 'thread_root' }
            ]
          )

          contexts = Course::Assessment::Question::ForumPostResponse.last.acting_as.grading_contexts
          expect(contexts.map(&:context_type)).to contain_exactly('sibling_question_answer', 'forum_thread')
          sibling_context = contexts.find { |context| context.context_type == 'sibling_question_answer' }
          expect(sibling_context.source_id).to eq(sibling.acting_as.id)
          expect(sibling_context.identifier).to eq('peer_answer')
        end
      end
    end

    describe '#edit' do
      let!(:forum_post_response) do
        forum_post_response = create(:course_assessment_question_forum_post_response, assessment: assessment)
        forum_post_response.question.update_column(:description, "<script>alert('boo');</script>")
        forum_post_response
      end

      subject do
        get :edit, as: :json, params: {
          course_id: course,
          assessment_id: assessment,
          id: forum_post_response
        }
      end

      context 'when edit page is loaded' do
        it 'sanitizes the description text' do
          subject
          expect(assigns(:forum_post_response_question).description).not_to include('script')
        end
      end
    end

    describe '#update' do
      let(:forum_post_response) { immutable_forum_post_response_question }
      subject do
        question_forum_post_response_attributes =
          attributes_for(:course_assessment_question_forum_post_response).
          slice(:description, :maximum_grade, :has_text_response, :max_posts)
        question_forum_post_response_attributes[:question_assessment] = { skill_ids: [''] }
        patch :update, params: {
          course_id: course, assessment_id: assessment, id: forum_post_response,
          question_forum_post_response: question_forum_post_response_attributes
        }
      end

      context 'when update fails' do
        before do
          controller.instance_variable_set(:@forum_post_response_question, forum_post_response)
        end

        it do
          is_expected.to have_http_status(:bad_request)
          expect(JSON.parse(response.body)['errors']).not_to be_nil
        end
      end

      context 'when switching to rubric grading mode' do
        let!(:forum_post_response) do
          create(:course_assessment_question_forum_post_response, assessment: assessment)
        end

        def patch_update(extra)
          attrs = { question_assessment: { skill_ids: [''] }, grading_mode: 'rubric' }.merge(extra)
          patch :update, params: {
            course_id: course, assessment_id: assessment, id: forum_post_response,
            question_forum_post_response: attrs
          }
        end

        it 'builds the active rubric directly from the params' do
          expect do
            patch_update(categories_attributes: {
              '0' => {
                name: 'Depth',
                criterions_attributes: { '0' => { grade: 0, explanation: '' },
                                         '1' => { grade: 3, explanation: '' } }
              }
            })
          end.to change(Course::Rubric, :count).by(1)

          reloaded = forum_post_response.reload
          expect(reloaded.grading_mode).to eq('rubric')
          expect(reloaded.active_rubric.categories.map(&:name)).to include('Depth')
        end
      end

      context 'when switching to default grading mode' do
        let!(:forum_post_response) do
          create(:course_assessment_question_forum_post_response, assessment: assessment)
        end
        let!(:active_rubric) do
          rubric = create(:course_rubric, course: course)
          forum_post_response.acting_as.update_columns(active_rubric_id: rubric.id, grading_mode: 'rubric')
          rubric
        end

        it 'retains the active rubric (kept dormant, not cleared)' do
          patch :update, params: {
            course_id: course, assessment_id: assessment, id: forum_post_response,
            question_forum_post_response: {
              question_assessment: { skill_ids: [''] }, grading_mode: 'default',
              maximum_grade: 10, has_text_response: false, max_posts: 1
            }
          }

          reloaded = forum_post_response.reload
          expect(reloaded.grading_mode).to eq('default')
          expect(reloaded.active_rubric_id).to eq(active_rubric.id)
        end
      end
    end

    describe '#destroy' do
      let(:forum_post_response) { immutable_forum_post_response_question }
      subject { post :destroy, params: { course_id: course, assessment_id: assessment, id: forum_post_response } }

      context 'when destroy fails' do
        it 'responds bad response with an error message' do
          expect(subject).to have_http_status(:bad_request)
          json_response = JSON.parse(response.body, { symbolize_names: true })
          expect(json_response[:errors]).to include(forum_post_response.errors.full_messages.to_sentence)
        end
      end
    end
  end
end
