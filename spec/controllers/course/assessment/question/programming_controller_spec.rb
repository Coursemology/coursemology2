# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::ProgrammingController do
  render_views
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:programming_question) { nil }
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }
    let(:assessment) { create(:assessment, course: course) }
    let(:question_programming_attributes) do
      attributes_for(:course_assessment_question_programming).
        slice(:title, :description, :maximum_grade, :language, :memory_limit,
              :time_limit).tap do |result|
        result[:language_id] = result.delete(:language).id
      end
    end
    let(:immutable_programming_question) do
      create(:course_assessment_question_programming, assessment: assessment).tap do |question|
        allow(question).to receive(:save).and_return(false)
        allow(question).to receive(:destroy).and_return(false)
      end
    end

    before do
      controller_sign_in(controller, user)
      controller.instance_variable_set(:@programming_question, programming_question)
    end

    describe '#create' do
      subject do
        request.accept = 'application/json'
        post :create, params: {
          course_id: course, assessment_id: assessment,
          question_programming: question_programming_attributes
        }
      end

      context 'when saving fails' do
        let(:programming_question) { immutable_programming_question }

        it 'returns bad request' do
          subject
          expect(response).to have_http_status(:bad_request)
        end
      end

      context 'when attaching a template package' do
        include Rails.application.routes.url_helpers

        let(:question_programming_attributes) do
          attributes_for(:course_assessment_question_programming, template_package: true).
            slice(:title, :description, :maximum_grade, :language, :memory_limit,
                  :time_limit, :file).tap do |result|
            result[:language_id] = result.delete(:language).id
            result[:file] = fixture_file_upload('course/programming_question_template.zip')
          end
        end

        it 'returns the correct import job url' do
          import_job_url = JSON.parse(subject.body)['importJobUrl']
          expect(import_job_url).to eq(job_path(controller.instance_variable_get(:@programming_question).import_job))
        end
      end
    end

    describe '#edit' do
      let!(:programming_question) do
        programming_question = create(:course_assessment_question_programming, assessment: assessment)
        programming_question.question.update_column(:description, "<script>alert('boo');</script>")
        programming_question
      end

      subject do
        get :edit, format: :json, params: {
          course_id: course,
          assessment_id: assessment,
          id: programming_question
        }
      end

      context 'when edit page is loaded' do
        it 'sanitizes the description text' do
          rendered_description = JSON.parse(subject.body)['question']['description']
          expect(rendered_description).not_to include('script')
        end
      end
    end

    describe '#update' do
      subject do
        request.accept = 'application/json'
        patch :update, params: {
          course_id: course, assessment_id: assessment, id: programming_question,
          question_programming: question_programming_attributes
        }
      end

      context 'when the question cannot be saved' do
        let(:programming_question) { immutable_programming_question }

        it 'returns bad request' do
          subject
          expect(response).to have_http_status(:bad_request)
        end
      end

      context 'when attaching a template package' do
        include Rails.application.routes.url_helpers

        let(:programming_question) do
          create(:course_assessment_question_programming,
                 assessment: assessment, template_package: true)
        end
        let(:question_programming_attributes) do
          attributes_for(:course_assessment_question_programming, template_package: true).
            slice(:title, :description, :maximum_grade, :language, :memory_limit,
                  :time_limit).tap do |result|
            result[:language_id] = result.delete(:language).id
            result[:file] = fixture_file_upload('course/programming_question_template.zip')
          end
        end

        it 'returns the correct import job url' do
          import_job_url = JSON.parse(subject.body)['importJobUrl']
          expect(import_job_url).to eq(job_path(controller.instance_variable_get(:@programming_question).import_job))
        end
      end
    end

    describe '#destroy' do
      let(:programming_question) { immutable_programming_question }
      subject do
        post :destroy, params: { course_id: course, assessment_id: assessment, id: programming_question }
      end

      context 'when the question cannot be destroyed' do
        let(:programming_question) { immutable_programming_question }

        it 'responds bad request with an error message' do
          expect(subject).to have_http_status(:bad_request)
          json_response = JSON.parse(response.body, { symbolize_names: true })
          expect(json_response[:errors]).to include(immutable_programming_question.errors.full_messages.to_sentence)
        end
      end
    end
  end
end
