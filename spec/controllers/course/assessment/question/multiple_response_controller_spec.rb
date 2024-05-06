# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::MultipleResponsesController, type: :controller do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:multiple_response) { nil }
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }
    let(:assessment) { create(:assessment, course: course) }
    let(:immutable_mrq) do
      create(:course_assessment_question_multiple_response, assessment: assessment).tap do |mrq|
        allow(mrq).to receive(:save).and_return(false)
        allow(mrq).to receive(:destroy).and_return(false)
      end
    end

    before do
      controller_sign_in(controller, user)
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
        let(:multiple_response) { immutable_mrq }

        it do
          is_expected.to have_http_status(:bad_request)
          expect(JSON.parse(response.body)['errors']).not_to be_nil
        end
      end
    end

    describe '#update' do
      let(:multiple_response) { immutable_mrq }
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

      context 'when changing existing MRQ to MCQ question type' do
        let!(:multiple_response) do
          create(:course_assessment_question_multiple_response, assessment: assessment)
        end
        subject do
          question_multiple_response_attributes =
            attributes_for(:course_assessment_question_multiple_response).
            slice(:description, :maximum_grade)
          question_multiple_response_attributes[:question_assessment] = { skill_ids: [''] }
          patch :update, as: :json, params: {
            course_id: course, assessment_id: assessment, id: multiple_response,
            question_multiple_response: question_multiple_response_attributes,
            multiple_choice: 'true'
          }
        end

        it do
          subject
          expect(multiple_response.grading_scheme).to eq('any_correct')
        end
      end

      context 'when changing existing MCQ to MRQ question type' do
        let!(:multiple_response) do
          create(:course_assessment_question_multiple_response, assessment: assessment)
        end
        subject do
          question_multiple_response_attributes =
            attributes_for(:course_assessment_question_multiple_response).
            slice(:description, :maximum_grade)
          question_multiple_response_attributes[:question_assessment] = { skill_ids: [''] }
          patch :update, params: {
            course_id: course, assessment_id: assessment, id: multiple_response,
            question_multiple_response: question_multiple_response_attributes,
            multiple_choice: 'false'
          }
        end

        it do
          expect(multiple_response.grading_scheme).to eq('all_correct')
        end
      end

      context 'when changing existing MRQ to MCQ question type in assessment page' do
        let!(:multiple_response) do
          create(:course_assessment_question_multiple_response, assessment: assessment)
        end
        subject do
          question_multiple_response_attributes =
            attributes_for(:course_assessment_question_multiple_response).
            slice(:description, :maximum_grade)
          question_multiple_response_attributes[:question_assessment] = { skill_ids: [''] }
          patch :update, as: :json, params: {
            course_id: course, assessment_id: assessment, id: multiple_response,
            question_multiple_response: question_multiple_response_attributes,
            multiple_choice: 'true'
          }
        end

        it do
          subject
          expect(multiple_response.reload.grading_scheme).to eq('any_correct')
        end
      end

      context 'when changing existing MCQ to MRQ question type in assessment show page' do
        let!(:multiple_response) do
          create(:course_assessment_question_multiple_response, assessment: assessment)
        end
        subject do
          question_multiple_response_attributes =
            attributes_for(:course_assessment_question_multiple_response).
            slice(:description, :maximum_grade)
          question_multiple_response_attributes[:question_assessment] = { skill_ids: [''] }
          patch :update, params: {
            course_id: course, assessment_id: assessment, id: multiple_response,
            question_multiple_response: question_multiple_response_attributes,
            multiple_choice: 'false'
          }
        end

        it do
          expect(multiple_response.grading_scheme).to eq('all_correct')
        end
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
          patch :update, as: :json, params: {
            course_id: course, assessment_id: assessment, id: multiple_response,
            question_multiple_response: question_multiple_response_attributes
          }
        end

        it 'updates a valid weight' do
          subject
          saved_weight = multiple_response.reload.options.unscope(:order).first.weight
          expect(saved_weight).to eq(weight)
        end
      end
    end

    describe '#destroy' do
      let(:multiple_response) { immutable_mrq }
      subject { post :destroy, params: { course_id: course, assessment_id: assessment, id: multiple_response } }

      context 'when destroy fails' do
        it 'responds bad response with an error message' do
          expect(subject).to have_http_status(:bad_request)
          json_response = JSON.parse(response.body, { symbolize_names: true })
          expect(json_response[:errors]).to include(immutable_mrq.errors.full_messages.to_sentence)
        end
      end
    end
  end
end
