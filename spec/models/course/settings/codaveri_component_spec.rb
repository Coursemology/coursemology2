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
      end

      it 'populates settings class with correct default values' do
        expect(settings.model).to eq(default_settings[:model])
        expect(settings.feedback_workflow).to eq(default_settings[:feedback_workflow])
        expect(settings.system_prompt).to eq(default_settings[:system_prompt])
      end
    end
  end
end
