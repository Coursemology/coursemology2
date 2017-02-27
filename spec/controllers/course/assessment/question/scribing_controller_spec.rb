# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::ScribingController do
  render_views
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:scribing_question) { nil }
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }
    let(:assessment) { create(:assessment, course: course) }
    let(:question_scribing_attributes) do
      attributes_for(:course_assessment_question_scribings).
        slice(:title, :description, :staff_only_comments, :maximum_grade,
              :attempt_limit)
    end
    let(:immutable_scribing_question) do
      create(:course_assessment_question_scribings, assessment: assessment).tap do |question|
        allow(question).to receive(:save).and_return(false)
        allow(question).to receive(:destroy).and_return(false)
      end
    end

    before do
      sign_in(user)
      return unless scribing_question
      controller.instance_variable_set(:@scribing_question, scribing_question)
    end

    describe '#create' do
      subject do
        request.accept = 'application/json'
        post :create, course_id: course, assessment_id: assessment,
                      question_scribing: question_scribing_attributes
      end

      context 'when saving fails' do
        let(:scribing_question) { immutable_scribing_question }

        it 'returns the correct status' do
          subject
          expect(response).to have_http_status(:bad_request)
        end

        it 'returns the correct failure message' do
          subject
          body = JSON.parse(response.body)
          # rubocop:disable LineLength
          expect(body['message']).to eq(I18n.t('course.assessment.question.scribing.create.failure'))
          # rubocop:enable LineLength
        end
      end
    end

    describe '#update' do
      subject do
        request.accept = 'application/json'
        patch :update, course_id: course, assessment_id: assessment, id: scribing_question,
                       question_scribing: question_scribing_attributes
      end

      context 'when the question cannot be saved' do
        let(:scribing_question) { immutable_scribing_question }

        it 'returns the correct status' do
          subject
          expect(response).to have_http_status(:bad_request)
        end

        it 'returns the correct failure message' do
          subject
          body = JSON.parse(response.body)
          # rubocop:disable LineLength
          expect(body['message']).to eq(I18n.t('course.assessment.question.scribing.update.failure'))
          # rubocop:enable LineLength
        end
      end
    end

    describe '#destroy' do
      let(:scribing_question) { immutable_scribing_question }
      subject do
        post :destroy, course_id: course, assessment_id: assessment, id: scribing_question
      end

      context 'when the question cannot be destroyed' do
        let(:scribing_question) { immutable_scribing_question }

        it { is_expected.to redirect_to(course_assessment_path(course, assessment)) }
        it 'sets the correct flash message' do
          subject
          expect(flash[:danger]).not_to be_empty
        end
      end
    end
  end
end
