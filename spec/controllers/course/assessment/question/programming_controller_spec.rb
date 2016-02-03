# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::ProgrammingController do
  let(:instance) { create(:instance) }
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
      sign_in(user)
      controller.instance_variable_set(:@programming_question, programming_question)
    end

    describe '#create' do
      subject do
        post :create, course_id: course, assessment_id: assessment,
                      question_programming: question_programming_attributes
      end

      context 'when saving fails' do
        let(:programming_question) { immutable_programming_question }
        it { is_expected.to render_template('new') }
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

        it 'redirects to job progress page' do
          subject
          expect(subject).to redirect_to(
            job_path(controller.instance_variable_get(:@programming_question).import_job))
        end
      end
    end

    describe '#update' do
      subject do
        patch :update, course_id: course, assessment_id: assessment, id: programming_question,
                       question_programming: question_programming_attributes
      end

      context 'when the question cannot be saved' do
        let(:programming_question) { immutable_programming_question }
        it { is_expected.to render_template('edit') }
      end

      context 'when attaching a template package' do
        include Rails.application.routes.url_helpers

        let(:programming_question) do
          create(:course_assessment_question_programming, assessment: assessment)
        end
        let(:question_programming_attributes) do
          attributes_for(:course_assessment_question_programming, template_package: true).
            slice(:title, :description, :maximum_grade, :language, :memory_limit,
                  :time_limit).tap do |result|
            result[:language_id] = result.delete(:language).id
            result[:file] = fixture_file_upload('course/programming_question_template.zip')
          end
        end

        it 'redirects to job progress page' do
          subject
          expect(subject).to redirect_to(
            job_path(controller.instance_variable_get(:@programming_question).import_job))
        end
      end
    end

    describe '#destroy' do
      let(:programming_question) { immutable_programming_question }
      subject do
        post :destroy, course_id: course, assessment_id: assessment, id: programming_question
      end

      context 'when the question cannot be destroyed' do
        let(:programming_question) { immutable_programming_question }

        it { is_expected.to redirect_to(course_assessment_path(course, assessment)) }
        it 'sets the correct flash message' do
          subject
          expect(flash[:danger]).not_to be_empty
        end
      end
    end
  end
end
