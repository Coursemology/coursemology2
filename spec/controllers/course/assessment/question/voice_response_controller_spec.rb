# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::VoiceResponsesController, type: :controller do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:voice_response) { nil }
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }
    let(:assessment) { create(:assessment, course: course) }
    let(:immutable_voice) do
      create(:course_assessment_question_voice_response, assessment: assessment).tap do |voice|
        allow(voice).to receive(:save).and_return(false)
        allow(voice).to receive(:destroy).and_return(false)
      end
    end

    before do
      controller_sign_in(controller, user)
      return unless voice_response

      controller.instance_variable_set(:@voice_response_question, voice_response)
    end

    describe '#create' do
      subject do
        question_voice_response_attributes =
          attributes_for(:course_assessment_question_voice_response).
          slice(:description, :maximum_grade)
        post :create, params: {
          course_id: course, assessment_id: assessment,
          question_voice_response: question_voice_response_attributes
        }
      end

      context 'when saving fails' do
        let(:voice_response) { immutable_voice }

        it do
          is_expected.to have_http_status(:bad_request)
          expect(JSON.parse(response.body)['errors']).not_to be_nil
        end
      end
    end

    describe '#update' do
      let(:voice_response) { immutable_voice }
      subject do
        question_voice_response_attributes =
          attributes_for(:course_assessment_question_voice_response).
          slice(:description, :maximum_grade)
        question_voice_response_attributes[:question_assessment] = { skill_ids: [''] }
        patch :update, params: {
          course_id: course, assessment_id: assessment, id: voice_response,
          question_voice_response: question_voice_response_attributes
        }
      end

      context 'when update fails' do
        before do
          controller.instance_variable_set(:@voice_response_question, voice_response)
        end

        it do
          is_expected.to have_http_status(:bad_request)
          expect(JSON.parse(response.body)['errors']).not_to be_nil
        end
      end
    end

    describe '#destroy' do
      let(:voice_response) { immutable_voice }
      subject { post :destroy, params: { course_id: course, assessment_id: assessment, id: voice_response } }

      context 'when destroy fails' do
        it 'responds bad response with an error message' do
          expect(subject).to have_http_status(:bad_request)
          json_response = JSON.parse(response.body, { symbolize_names: true })
          expect(json_response[:errors]).to include(immutable_voice.errors.full_messages.to_sentence)
        end
      end
    end
  end
end
