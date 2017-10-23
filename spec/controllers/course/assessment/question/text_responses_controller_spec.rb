# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::TextResponsesController do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:text_response) { nil }
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }
    let(:assessment) { create(:assessment, course: course) }
    let(:immutable_text_response_question) do
      create(:course_assessment_question_text_response, assessment: assessment).tap do |question|
        allow(question).to receive(:save).and_return(false)
        allow(question).to receive(:destroy).and_return(false)
      end
    end

    before do
      sign_in(user)
      return unless text_response
      controller.instance_variable_set(:@text_response_question, text_response)
    end

    describe '#create' do
      subject do
        question_text_response_attributes =
          attributes_for(:course_assessment_question_text_response).
          slice(:description, :maximum_grade)
        post :create, params: {
          course_id: course, assessment_id: assessment,
          question_text_response: question_text_response_attributes
        }
      end

      context 'when saving fails' do
        let(:text_response) { immutable_text_response_question }
        it do
          is_expected.to render_template('new')
        end
      end
    end

    describe '#update' do
      let(:text_response) { immutable_text_response_question }
      subject do
        question_text_response_attributes =
          attributes_for(:course_assessment_question_text_response).
          slice(:description, :maximum_grade)
        patch :update, params: {
          course_id: course, assessment_id: assessment, id: text_response,
          question_text_response: question_text_response_attributes
        }
      end

      it do
        is_expected.to render_template('edit')
      end
    end

    describe '#destroy' do
      let(:text_response) { immutable_text_response_question }
      subject { post :destroy, params: { course_id: course, assessment_id: assessment, id: text_response } }

      it { is_expected.to redirect_to(course_assessment_path(course, assessment)) }
      it 'sets the correct flash message' do
        subject
        expect(flash[:danger]).not_to be_empty
      end
    end
  end
end
