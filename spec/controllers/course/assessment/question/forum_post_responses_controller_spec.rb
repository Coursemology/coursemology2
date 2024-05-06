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
      return unless forum_post_response

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
