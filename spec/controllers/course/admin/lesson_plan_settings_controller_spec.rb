# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Admin::LessonPlanSettingsController, type: :controller do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }
    let(:json_response) { JSON.parse(response.body) }
    before { sign_in(user) }

    describe '#edit' do
      subject { get :edit, params: { course_id: course } }
      it { is_expected.to render_template(:edit) }
    end

    describe '#update' do
      subject { patch :update, params: { course_id: course, lesson_plan_settings: payload } }

      context 'when valid parameters are received' do
        render_views
        let(:tab) { create(:course_assessment_tab, course: course) }
        let(:payload) do
          {
            lesson_plan_item_settings:
              {
                'component' => 'course_assessments_component',
                'tab_title' => tab.title,
                'options' => { category_id: tab.category.id, tab_id: tab.id },
                'enabled' => false
              }
          }
        end
        before { subject }

        it 'responds with the necessary fields' do
          tab_enabled_setting =
            json_response.find { |setting| setting['options']['tab_id'] == tab.id }
          expect(tab_enabled_setting['enabled']).to eq(false)
        end
      end

      context 'when invalid parameters are received' do
        let(:payload) { { lesson_plan_item_settings: { 'component' => 'invalid_component' } } }
        it { is_expected.to have_http_status(:bad_request) }
      end
    end
  end
end
