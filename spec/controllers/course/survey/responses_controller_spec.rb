# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Survey::ResponsesController do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:admin) { create(:administrator) }
    let!(:course) { create(:course, creator: admin) }
    let!(:student) { create(:course_student, course: course) }
    let!(:survey) { create(:survey, course: course) }
    let!(:survey_question) do
      section = create(:course_survey_section, survey: survey)
      create(:course_survey_question, question_type: :text, section: section)
    end
    let(:response) { create(:response, *response_traits, survey: survey, creator: student.user) }
    let(:response_traits) { nil }

    before { sign_in(user) }

    describe '#update' do
      context 'when params include unsubmitting of the survey response' do
        let(:user) { admin }
        let(:response_traits) { :submitted }
        let!(:response_answer) do
          create(:course_survey_answer, question: survey_question, response: response)
        end
        let(:new_response_text) { response_answer.text_response + 'New Stuff' }
        let(:response_params) do
          { unsubmit: true,
            answer_attributes: { id: response_answer.id, text_response: new_response_text } }
        end
        subject do
          patch :update, format: :json, course_id: course.id, survey_id: survey.id, id: response.id,
                         response: response_params
        end

        it 'unsubmits the survey response' do
          subject
          expect(response.reload.submitted?).to be_falsey
        end

        it 'does not update the answer attributes' do
          subject
          expect(response.reload.answers.first.text_response).not_to eq(new_response_text)
        end

        context 'when user is a student' do
          let(:user) { student.user }

          it 'raises an error' do
            expect { subject }.to raise_exception(CanCan::AccessDenied)
          end
        end
      end
    end
  end
end
