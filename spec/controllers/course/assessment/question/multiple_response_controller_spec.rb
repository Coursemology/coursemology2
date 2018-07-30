# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::MultipleResponsesController do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:multiple_response) { nil }
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }
    let(:assessment) { create(:assessment, course: course) }
    let(:immutable_multiple_response_question) do
      create(:course_assessment_question_multiple_response, assessment: assessment).tap do |mrq|
        allow(mrq).to receive(:save).and_return(false)
        allow(mrq).to receive(:destroy).and_return(false)
      end
    end

    before do
      sign_in(user)
      return unless multiple_response
      controller.instance_variable_set(:@multiple_response_question, multiple_response)
    end

    describe '#create' do
      subject do
        question_multiple_response_attributes =
          attributes_for(:course_assessment_question_multiple_response).
          slice(:description, :maximum_grade)
        post :create, params: {
          course_id: course, assessment_id: assessment,
          question_multiple_response: question_multiple_response_attributes
        }
      end

      context 'when saving fails' do
        let(:multiple_response) { immutable_multiple_response_question }
        it do
          is_expected.to render_template('new')
        end
      end
    end

    describe '#update' do
      let(:multiple_response) { immutable_multiple_response_question }
      subject do
        question_multiple_response_attributes =
          attributes_for(:course_assessment_question_multiple_response).
          slice(:description, :maximum_grade)
        question_multiple_response_attributes[:question_assessment] = { skill_ids: [''] }
        patch :update, params: {
          course_id: course, assessment_id: assessment, id: multiple_response,
          question_multiple_response: question_multiple_response_attributes
        }
      end

      it do
        is_expected.to render_template('edit')
      end

      context 'when weight is updated' do
        # Mutable multiple response question
        let(:weight) { 5 }
        let!(:multiple_response) do
          create(:course_assessment_question_multiple_response, assessment: assessment)
        end
        subject do
          question_multiple_response_attributes =
            {
              'options_attributes' =>
                {
                  '0' =>
                    {
                      id: multiple_response.options.first.id,
                      weight: weight
                    },
                  '1' =>
                    {
                      id: multiple_response.options.second.id,
                      weight: multiple_response.options.second.weight
                    }
                },
              question_assessment: { skill_ids: [''] }
            }
          patch :update, params: {
            course_id: course, assessment_id: assessment, id: multiple_response,
            question_multiple_response: question_multiple_response_attributes
          }
        end

        it 'updates a valid weight' do
          subject
          saved_weight = multiple_response.reload.options.first.weight
          expect(saved_weight).to eq(weight)
        end
      end
    end

    describe '#destroy' do
      let(:multiple_response) { immutable_multiple_response_question }
      subject { post :destroy, params: { course_id: course, assessment_id: assessment, id: multiple_response } }

      it { is_expected.to redirect_to(course_assessment_path(course, assessment)) }
      it 'sets the correct flash message' do
        subject
        expect(flash[:danger]).not_to be_empty
      end
    end
  end
end
