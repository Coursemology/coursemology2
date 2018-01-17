# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Settings::SurveyComponent do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:settings) do
      context = OpenStruct.new(current_course: course, key: Course::SurveyComponent.key)
      Course::Settings::SurveyComponent.new(context)
    end

    describe '#update_lesson_plan_item_settings' do
      let(:payload) do
        { 'enabled' => false, 'visible' => false, 'component' => 'course_survey_component' }
      end
      subject { settings.update_lesson_plan_item_setting(payload) && course.save! }

      it 'persists the settings' do
        subject
        lesson_plan_setting = settings.lesson_plan_item_settings

        expect(lesson_plan_setting[:enabled]).to eq(payload['enabled'])
        expect(lesson_plan_setting[:visible]).to eq(payload['visible'])
      end
    end
  end
end
