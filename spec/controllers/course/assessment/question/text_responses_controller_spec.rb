# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::TextResponsesController do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:text_response) { nil }
    let(:user) { create(:course_manager, course: course).user }
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, course: course) }
    let(:immutable_text_response_question) do
      create(:course_assessment_question_text_response, assessment: assessment).tap do |question|
        allow(question).to receive(:save).and_return(false)
        allow(question).to receive(:destroy).and_return(false)
      end
    end

    before do
      controller_sign_in(controller, user)
      return unless text_response

      controller.instance_variable_set(:@text_response_question, text_response)
    end

    describe '#create' do
      subject do
        question_text_response_attributes =
          attributes_for(:course_assessment_question_text_response).
          slice(:description, :maximum_grade, :max_attachments)
        post :create, params: {
          course_id: course, assessment_id: assessment,
          question_text_response: question_text_response_attributes
        }
      end

      context 'when saving fails' do
        let(:text_response) { immutable_text_response_question }
        it do
          is_expected.to have_http_status(:bad_request)
          expect(JSON.parse(response.body)['errors']).not_to be_nil
        end
      end
    end

    describe '#edit' do
      let!(:text_response) do
        text_response = create(:course_assessment_question_text_response, assessment: assessment)
        text_response.question.update_column(:description, "<script>alert('boo');</script>")
        text_response.solutions.first.update_column(:explanation, "<script>alert('explain');</script>")
        text_response
      end

      subject do
        get :edit, as: :json, params: {
          course_id: course,
          assessment_id: assessment,
          id: text_response
        }
      end

      context 'when edit page is loaded' do
        it 'sanitizes the description text' do
          subject
          expect(assigns(:text_response_question).description).not_to include('script')
        end

        it 'sanitizes the explanation text' do
          subject
          expect(assigns(:text_response_question).solutions.first.explanation).not_to include('script')
        end
      end
    end

    describe '#update' do
      let(:text_response) { immutable_text_response_question }
      subject do
        question_text_response_attributes =
          attributes_for(:course_assessment_question_text_response).
          slice(:description, :maximum_grade)
        question_text_response_attributes[:question_assessment] = { skill_ids: [''] }
        patch :update, params: {
          course_id: course, assessment_id: assessment, id: text_response,
          question_text_response: question_text_response_attributes
        }
      end

      context 'when update fails' do
        before do
          controller.instance_variable_set(:@text_response_question, text_response)
        end

        it do
          is_expected.to have_http_status(:bad_request)
          expect(JSON.parse(response.body)['errors']).not_to be_nil
        end
      end
    end

    describe '#destroy' do
      let(:text_response) { immutable_text_response_question }
      subject { post :destroy, params: { course_id: course, assessment_id: assessment, id: text_response } }

      context 'when destroy fails' do
        it 'responds bad response with an error message' do
          expect(subject).to have_http_status(:bad_request)
          json_response = JSON.parse(response.body, { symbolize_names: true })
          expect(json_response[:errors]).to include(text_response.errors.full_messages.to_sentence)
        end
      end
    end
  end
end
