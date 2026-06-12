# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Admin::GradebookSettingsController, type: :controller do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:manager) { create(:course_manager, course: course) }
    let(:teaching_assistant) { create(:course_teaching_assistant, course: course) }
    let(:student) { create(:course_student, course: course) }

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

        it 'reflects an already-enabled setting' do
          ctx = Struct.new(:current_course, :key).new(course, Course::GradebookComponent.key)
          Course::Settings::GradebookComponent.new(ctx).weighted_view_enabled = true
          course.save!
          get :edit, params: { course_id: course.id }, format: :json
          expect(JSON.parse(response.body)).to include('weightedViewEnabled' => true)
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

      context 'as student' do
        before { controller_sign_in(controller, student.user) }

        it 'is denied' do
          expect do
            get :edit, params: { course_id: course.id }, format: :json
          end.to raise_error(CanCan::AccessDenied)
        end
      end

      context 'when the gradebook component is disabled' do
        before do
          controller_sign_in(controller, manager.user)
          allow(controller).to receive_message_chain('current_component_host.[]').and_return(nil)
        end

        it 'raises a component not found error' do
          expect do
            get :edit, params: { course_id: course.id }, format: :json
          end.to raise_error(ComponentNotFoundError)
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
          contribution = create(:course_gradebook_contribution, tab: tab, course: course, weight: 50)

          patch :update,
                params: { course_id: course.id,
                          settings_gradebook_component: { weighted_view_enabled: true } },
                format: :json
          expect(contribution.reload.weight).to eq(50)

          patch :update,
                params: { course_id: course.id,
                          settings_gradebook_component: { weighted_view_enabled: false } },
                format: :json
          expect(contribution.reload.weight).to eq(50)
        end

        it 'renders errors with 400 when persistence fails' do
          allow_any_instance_of(Course).to receive(:save).and_return(false)
          patch :update,
                params: { course_id: course.id,
                          settings_gradebook_component: { weighted_view_enabled: true } },
                format: :json
          expect(response).to have_http_status(:bad_request)
          expect(JSON.parse(response.body)).to have_key('errors')
        end

        it 'raises ParameterMissing when settings_gradebook_component is absent' do
          expect do
            patch :update, params: { course_id: course.id }, format: :json
          end.to raise_error(ActionController::ParameterMissing)
        end

        it 'ignores attributes outside the permitted set' do
          patch :update,
                params: { course_id: course.id,
                          settings_gradebook_component: {
                            weighted_view_enabled: true, some_forbidden_attr: 'x'
                          } },
                format: :json
          expect(response).to have_http_status(:ok)
          expect(JSON.parse(response.body)).to include('weightedViewEnabled' => true)
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

      context 'as student' do
        let(:student) { create(:course_student, course: course) }
        before { controller_sign_in(controller, student.user) }

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
