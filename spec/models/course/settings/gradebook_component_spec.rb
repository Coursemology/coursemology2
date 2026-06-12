# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Settings::GradebookComponent do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:settings) do
      context = OpenStruct.new(current_course: course, key: Course::GradebookComponent.key)
      Course::Settings::GradebookComponent.new(context)
    end

    describe '#weighted_view_enabled' do
      it 'returns false by default' do
        expect(settings.weighted_view_enabled).to eq(false)
      end
    end

    describe '#weighted_view_enabled=' do
      it 'persists true when set to true' do
        settings.weighted_view_enabled = true
        course.save!
        expect(settings.weighted_view_enabled).to eq(true)
      end

      it 'persists false when set to false after being true' do
        settings.weighted_view_enabled = true
        course.save!
        settings.weighted_view_enabled = false
        course.save!
        expect(settings.weighted_view_enabled).to eq(false)
      end

      it 'survives a reload into a fresh component instance' do
        settings.weighted_view_enabled = true
        course.save!
        course.reload
        fresh = Course::Settings::GradebookComponent.new(
          OpenStruct.new(current_course: course, key: Course::GradebookComponent.key)
        )
        expect(fresh.weighted_view_enabled).to eq(true)
      end

      it 'handles string "1" as truthy' do
        settings.weighted_view_enabled = '1'
        expect(settings.weighted_view_enabled).to eq(true)
      end

      it 'handles string "true" as truthy' do
        settings.weighted_view_enabled = 'true'
        expect(settings.weighted_view_enabled).to eq(true)
      end

      it 'handles string "on" as truthy' do
        settings.weighted_view_enabled = 'on'
        expect(settings.weighted_view_enabled).to eq(true)
      end

      it 'handles string "0" as falsy' do
        settings.weighted_view_enabled = '0'
        expect(settings.weighted_view_enabled).to eq(false)
      end

      it 'handles string "false" as falsy' do
        settings.weighted_view_enabled = 'false'
        expect(settings.weighted_view_enabled).to eq(false)
      end

      it 'handles string "off" as falsy' do
        settings.weighted_view_enabled = 'off'
        expect(settings.weighted_view_enabled).to eq(false)
      end
    end
  end
end
