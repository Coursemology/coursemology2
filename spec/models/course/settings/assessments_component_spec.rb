# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Settings::AssessmentsComponent do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:category) { course.assessment_categories.first }
    let(:tab) { category.tabs.first }
    let(:settings) do
      context = OpenStruct.new(current_course: course, key: Course::AssessmentsComponent.key)
      Course::Settings::AssessmentsComponent.new(context)
    end

    describe '.delete_lesson_plan_item_setting' do
      let(:payload) do
        { 'enabled' => false, 'options' => { 'tab_id' => tab.id } }
      end
      subject do
        Course::Settings::AssessmentsComponent.delete_lesson_plan_item_setting(course, tab.id)
      end

      context 'when there is a custom setting' do
        before { settings.update_lesson_plan_item_setting(payload) && course.save! }

        it 'removes the custom setting' do
          subject

          # Get the setting manually to avoid getting the default value.
          setting = tab.category.course.settings(Course::AssessmentsComponent.key,
                                                 :lesson_plan_items, "tab_#{tab.id}").enabled
          expect(setting).to be_nil
        end
      end

      context 'when there is no custom setting' do
        it 'leaves the settings alone' do
          original_setting = tab.category.course.settings(Course::AssessmentsComponent.key,
                                                          :lesson_plan_items,
                                                          "tab_#{tab.id}").enabled
          expect(original_setting).to be_nil

          subject

          new_setting = tab.category.course.settings(Course::AssessmentsComponent.key,
                                                     :lesson_plan_items,
                                                     "tab_#{tab.id}").enabled
          expect(new_setting).to be_nil
        end
      end
    end

    describe '#update_lesson_plan_item_settings' do
      let(:payload) do
        { 'enabled' => false, 'options' => { 'tab_id' => tab.id } }
      end
      subject { settings.update_lesson_plan_item_setting(payload) && course.save! }

      it 'persists the setting' do
        subject
        tab_enabled_setting = settings.lesson_plan_item_settings.flatten.select do |setting|
          setting[:options][:tab_id] == tab.id
        end.first

        expect(tab_enabled_setting[:enabled]).to eq(payload['enabled'])
      end
    end
  end
end
