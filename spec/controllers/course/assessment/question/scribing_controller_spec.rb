# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::ScribingController do
  render_views
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }
    let(:assessment) { create(:assessment, course: course) }
    let(:scribing_question) { nil }
    let(:question_scribing_attributes) do
      attributes_for(:course_assessment_question_scribing).
        slice(:title, :description, :staff_only_comments, :maximum_grade, :file).
        merge(question_assessment: { skill_ids: [''] })
    end
    let(:question_scribing_update_attributes) do
      attributes_for(:course_assessment_question_scribing).
        slice(:title, :description, :staff_only_comments, :maximum_grade).
        merge(question_assessment: { skill_ids: [''] })
    end
    let(:immutable_scribing_question) do
      create(:course_assessment_question_scribing, assessment: assessment).tap do |question|
        allow(question).to receive(:save).and_return(false)
        allow(question).to receive(:destroy).and_return(false)
      end
    end

    before do
      controller_sign_in(controller, user)
      controller.instance_variable_set(:@scribing_question, scribing_question)
    end

    describe '#create' do
      subject do
        request.accept = 'application/json'
        post :create, params: {
          course_id: course, assessment_id: assessment,
          question_scribing: question_scribing_attributes
        }
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
          expect(body['message']).to eq(
            I18n.t('course.assessment.question.scribing.create.failure')
          )
        end
      end

      context 'when attaching an image attachment' do
        let(:question_scribing_attributes) do
          attributes_for(:course_assessment_question_scribing).
            slice(:title, :description, :maximum_grade, :file).tap do |result|
            result[:file] = fixture_file_upload('files/picture.jpg', 'image/jpeg')
          end
        end

        it 'returns the correct attachment' do
          subject
          body = JSON.parse(response.body)
          expect(body['question']['attachment_reference']['name']).to eq(
            controller.instance_variable_get(:@scribing_question).attachment_reference.name
          )
        end
      end

      context 'when attaching a pdf attachment' do
        let(:question_scribing_attributes) do
          attributes_for(:course_assessment_question_scribing).
            slice(:title, :description, :maximum_grade, :file).tap do |result|
            result[:file] = fixture_file_upload(file_path, 'application/pdf')
          end
        end
        let(:file_path) { 'files/one-page-document.pdf' }

        # "CircleCI's imagemagick installation is flaky"
        pending 'when the pdf is one page' do
          it 'creates one scribing question with a png attachment' do
            expect { subject }.to change { Course::Assessment::Question::Scribing.count }.by(1)

            message = JSON.parse(response.body)['message']
            expect(message).to eq(I18n.t('course.assessment.question.scribing.create.success'))

            attachment = assessment.questions.last.specific.attachment
            expect(attachment.present?).to be_truthy
            expect(attachment.name).to eq('one-page-document[1].png')
          end
        end

        # "CircleCI's imagemagick installation is flaky"
        pending 'when the pdf is two pages' do
          it 'creates one scribing question with a png attachment for each pdf page' do
            expect { subject }.to change { Course::Assessment::Question::Scribing.count }.by(2)

            message = JSON.parse(response.body)['message']
            expect(message).to eq(I18n.t('course.assessment.question.scribing.create.success'))

            assessment.questions.map { |q| q.specific.attachment }.each.with_index(1) do |a, i|
              expect(a.present?).to be_truthy
              expect(a.name).to eq("two-page-document[#{i}].png")
            end
          end
        end
      end
    end

    describe '#edit' do
      let!(:scribing_question) do
        scribing_question = create(:course_assessment_question_scribing, assessment: assessment)
        scribing_question.question.update_column(:description, "<script>alert('boo');</script>")
        scribing_question
      end

      subject do
        get :edit,
            params: {
              course_id: course,
              assessment_id: assessment,
              id: scribing_question
            },
            format: :json
      end

      context 'when edit page is loaded' do
        it 'sanitizes the description text' do
          expect(scribing_question.description).to include('script')
          subject
          json_response = JSON.parse(response.body)['question']
          expect(json_response['description']).not_to include('script')
        end
      end
    end

    describe '#update' do
      subject do
        request.accept = 'application/json'
        patch :update, params: {
          course_id: course, assessment_id: assessment, id: scribing_question,
          question_scribing: question_scribing_update_attributes
        }
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
          expect(body['message']).to eq(
            I18n.t('course.assessment.question.scribing.update.failure')
          )
        end
      end
    end

    describe '#destroy' do
      subject { post :destroy, params: { course_id: course, assessment_id: assessment, id: scribing_question } }

      context 'when question is destroyed' do
        let!(:scribing_question) do
          create(:course_assessment_question_scribing, assessment: assessment)
        end

        it { is_expected.to have_http_status(:ok) }
      end

      context 'when the question cannot be destroyed' do
        let(:scribing_question) { immutable_scribing_question }

        it 'responds bad request with an error message' do
          expect(subject).to have_http_status(:bad_request)
          json_response = JSON.parse(response.body, { symbolize_names: true })
          expect(json_response[:errors]).to include(immutable_scribing_question.errors.full_messages.to_sentence)
        end
      end
    end
  end
end
