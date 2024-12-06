# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::LiveFeedbackSettings::SettingsController do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:user) { create(:user) }
    let!(:course) { create(:course, creator: user) }
    let(:category) { course.assessment_categories.first }
    let(:tab) { category.tabs.first }
    let!(:immutable_assessment) do
      create(:assessment, course: course).tap do |stub|
        allow(stub).to receive(:destroy).and_return(false)
      end
    end

    before { controller_sign_in(controller, user) }

    describe '#index' do
      render_views
      let(:assessment) { create(:assessment, course: course) }
      let(:lang_valid_for_codaveri) { Coursemology::Polyglot::Language::Python::Python3Point12.instance }
      let(:lang_invalid_for_codaveri) { Coursemology::Polyglot::Language::Java::Java8.instance }
      let!(:programming_qn1) do
        create(:course_assessment_question_programming, assessment: assessment,
                                                        language: lang_valid_for_codaveri,
                                                        template_package: true)
      end
      let!(:programming_qn2) do
        create(:course_assessment_question_programming, assessment: assessment,
                                                        language: lang_invalid_for_codaveri,
                                                        template_package: true)
      end

      subject do
        get :index, as: :json, params: {
          course_id: course.id,
          assessment_id: assessment.id
        }
      end

      context 'on fetching the live feedback settings for this assessment' do
        it 'returns programming languages that has valid languages for codaveri' do
          subject

          json_result = JSON.parse(response.body)
          expect(json_result['assessments'][0]['programmingQuestions'].count).to eq(1)
        end
      end
    end

    describe '#edit' do
      let(:assessment) { create(:assessment, course: course) }

      # TODO: this part needs to be updated everytime codaveri_language_whitelist is updated
      let(:lang_valid_for_codaveri) { Coursemology::Polyglot::Language::Python::Python3Point12.instance }
      let(:lang_invalid_for_codaveri) { Coursemology::Polyglot::Language::Java::Java8.instance }
      let!(:programming_qn1) do
        create(:course_assessment_question_programming, assessment: assessment,
                                                        language: lang_valid_for_codaveri,
                                                        template_package: true)
      end
      let!(:programming_qn2) do
        create(:course_assessment_question_programming, assessment: assessment,
                                                        language: lang_valid_for_codaveri,
                                                        template_package: true)
      end

      subject do
        patch :edit, params: {
          course_id: course.id,
          assessment_id: assessment.id,
          live_feedback_settings: {
            enabled: true
          }
        }
      end

      context 'on fetching the live feedback settings for this assessment' do
        it 'returns programming languages that has valid languages for codaveri' do
          subject

          expect(programming_qn1.reload.live_feedback_enabled).to eq(true)
          expect(programming_qn2.reload.live_feedback_enabled).to eq(true)
        end
      end
    end
  end
end
