# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Admin::GradebookSettingsController, type: :controller do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:manager) { create(:course_manager, course: course) }
    let(:teaching_assistant) { create(:course_teaching_assistant, course: course) }

    describe '#edit' do
      context 'as manager' do
        render_views
        before { controller_sign_in(controller, manager.user) }

        it 'returns settings JSON' do
          get :edit, params: { course_id: course.id }, format: :json
          expect(response).to have_http_status(:ok)
          body = JSON.parse(response.body)
          expect(body).to include('weightedViewEnabled' => false)
        end
      end

      context 'as teaching assistant' do
        before { controller_sign_in(controller, teaching_assistant.user) }

        it 'is denied' do
          expect do
            get :edit, params: { course_id: course.id }, format: :json
          end.to raise_error(CanCan::AccessDenied)
        end
      end
    end

    describe '#update' do
      context 'as manager' do
        render_views
        before { controller_sign_in(controller, manager.user) }

        it 'updates weighted_view_enabled and returns 200' do
          patch :update,
                params: { course_id: course.id,
                          settings_gradebook_component: { weighted_view_enabled: true } },
                format: :json
          expect(response).to have_http_status(:ok)
          body = JSON.parse(response.body)
          expect(body).to include('weightedViewEnabled' => true)
        end

        it 'preserves existing tab gradebook_weights when toggling setting' do
          category = create(:course_assessment_category, course: course)
          tab = create(:course_assessment_tab, category: category)
          tab.update!(gradebook_weight: 50)

          patch :update,
                params: { course_id: course.id,
                          settings_gradebook_component: { weighted_view_enabled: true } },
                format: :json
          expect(tab.reload.gradebook_weight).to eq(50)

          patch :update,
                params: { course_id: course.id,
                          settings_gradebook_component: { weighted_view_enabled: false } },
                format: :json
          expect(tab.reload.gradebook_weight).to eq(50)
        end
      end

      context 'as teaching assistant' do
        before { controller_sign_in(controller, teaching_assistant.user) }

        it 'is denied' do
          expect do
            patch :update,
                  params: { course_id: course.id,
                            settings_gradebook_component: { weighted_view_enabled: true } },
                  format: :json
          end.to raise_error(CanCan::AccessDenied)
        end
      end
    end
  end
end
