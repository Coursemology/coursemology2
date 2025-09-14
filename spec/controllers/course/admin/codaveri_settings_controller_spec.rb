# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Admin::CodaveriSettingsController, type: :controller do
  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:lang_valid_for_codaveri) { Coursemology::Polyglot::Language::Python::Python3Point12.instance }
    let(:lang_invalid_for_codaveri) { Coursemology::Polyglot::Language::Java::Java8.instance }
    let(:course) do
      course = create(:course, creator: user)
      assessment = create(:assessment, course: course)
      create(:course_assessment_question_programming,
             assessment: assessment, language: lang_valid_for_codaveri, template_package: true)
      create(:course_assessment_question_programming,
             assessment: assessment, language: lang_invalid_for_codaveri, template_package: true)
      course
    end
    let(:course2) do
      course = create(:course, creator: user)
      assessment = create(:assessment, course: course)
      create(:course_assessment_question_programming,
             assessment: assessment, language: lang_valid_for_codaveri, template_package: true)
      create(:course_assessment_question_programming,
             assessment: assessment, language: lang_valid_for_codaveri, template_package: true)
      course
    end
    before { controller_sign_in(controller, user) }

    describe '#edit' do
      render_views
      subject { get :edit, params: { course_id: course, format: :json } }
      it 'renders codaveri and assessment question settings' do
        expect(subject).to render_template(:edit)
        programming_questions = JSON.parse(subject.body).dig('assessments', 0, 'programmingQuestions')
        expect(programming_questions).not_to be_nil
        expect(programming_questions).to be_an_instance_of(Array)
        expect(programming_questions.count).to eq(1)
      end
    end

    describe '#update' do
      before { allow(controller).to receive(:current_course).and_return(course) }
      context 'when course cannot be saved' do
        before { allow(course).to receive(:save).and_return(false) }
        subject do
          patch :update, params: {
            course_id: course,
            settings_codaveri_component: { feedback_workflow: 'invalid' }
          }
        end
        it 'returns bad_request with errors' do
          expect(subject).to have_http_status(:bad_request)
          expect(JSON.parse(subject.body)['errors']).not_to be_nil
        end
      end

      context 'when course can be saved, but user is not an admin' do
        before { allow(user).to receive(:instance_administrator?).and_return(false) }
        subject do
          patch :update, params: {
            course_id: course,
            settings_codaveri_component: { model: 'gpt-5' }
          }
        end
        it 'returns forbidden' do
          expect(subject).to have_http_status(:forbidden)
        end
      end
    end

    describe '#update_live_feedback_enabled' do
      context 'when the live feedback is enabled for all assessments within course' do
        subject do
          patch :update_live_feedback_enabled, params: {
            course_id: course2,
            update_live_feedback_enabled: {
              live_feedback_enabled: true,
              programming_question_ids: course2.assessments.first.programming_questions.map(&:id)
            }
          }
        end

        it 'will activate live feedback for all questions within those assessments' do
          subject

          question1 = course2.assessments.first.questions.first
          question2 = course2.assessments.first.questions.second

          expect(question1.specific.live_feedback_enabled).to eq(true)
          expect(question2.specific.live_feedback_enabled).to eq(true)
        end
      end
    end
  end
end
