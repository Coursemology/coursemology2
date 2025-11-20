# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Settings::CodaveriComponent do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:settings) do
      context = OpenStruct.new(current_course: course, key: Course::CodaveriComponent.key)
      Course::Settings::CodaveriComponent.new(context)
    end
    let(:default_settings) { Course::Settings::CodaveriComponent.default_settings }

    context 'when I create a new course' do
      it 'populates course with correct default values' do
        expect(course.codaveri_model).to eq(default_settings[:model])
        expect(course.codaveri_feedback_workflow).to eq(default_settings[:feedback_workflow])
        expect(course.codaveri_system_prompt).to eq(default_settings[:system_prompt])
        expect(course.codaveri_override_system_prompt?).to eq(default_settings[:override_system_prompt])
        expect(course.codaveri_get_help_usage_limited?).to eq(default_settings[:usage_limited_for_get_help])
        expect(course.codaveri_max_get_help_user_messages).to eq(default_settings[:max_get_help_user_messages])
      end

      it 'populates settings class with correct default values' do
        expect(settings.model).to eq(default_settings[:model])
        expect(settings.feedback_workflow).to eq(default_settings[:feedback_workflow])
        expect(settings.system_prompt).to eq(default_settings[:system_prompt])
        expect(settings.override_system_prompt).to eq(default_settings[:override_system_prompt])
        expect(settings.usage_limited_for_get_help?).to eq(default_settings[:usage_limited_for_get_help])
        expect(settings.max_get_help_user_messages).to eq(default_settings[:max_get_help_user_messages])
      end
    end
  end
end
