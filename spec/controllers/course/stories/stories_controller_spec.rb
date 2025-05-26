# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Stories::StoriesController, type: :controller do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:json_response) { JSON.parse(response.body) }
    let(:course) { create(:course, :with_stories_component_enabled) }

    before do
      course.settings(:course_stories_component).push_key = 'test_push_key'
      course.save!
    end

    describe '#learn_settings' do
      context 'As a Course Manager' do
        let(:user) { create(:course_manager, course: course).user }

        before do
          course.settings(:course_stories_component).title = 'Course Manager Story Title'
          course.save!
          controller_sign_in(controller, user)
        end

        it 'returns the correct story title in JSON' do
          get :learn_settings, params: { course_id: course.id }, format: :json
          expect(response).to have_http_status(:ok)
          json = JSON.parse(response.body)
          expect(json['title']).to eq('Course Manager Story Title')
        end
      end

      context 'As a Course Student' do
        let(:user) { create(:course_student, course: course).user }

        before do
          course.settings(:course_stories_component).title = 'Course Student Story Title'
          course.save!
          controller_sign_in(controller, user)
        end

        it 'returns the correct story title in JSON' do
          get :learn_settings, params: { course_id: course.id }, format: :json
          expect(response).to have_http_status(:ok)
          json = JSON.parse(response.body)
          expect(json['title']).to eq('Course Student Story Title')
        end
      end
    end
  end
end
