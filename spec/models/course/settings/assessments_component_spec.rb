# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Settings::AssessmentsComponent do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:category) { course.assessment_categories.first }
    let(:settings) do
      context = OpenStruct.new(current_course: course, key: Course::AssessmentsComponent.key)
      Course::Settings::AssessmentsComponent.new(context)
    end

    describe '.email_enabled?' do
      subject { Course::Settings::AssessmentsComponent.email_enabled?(category, key) }

      context 'when email setting key is valid' do
        let(:key) { :assessment_opening }

        context 'when there is no custom setting' do
          it 'returns the default setting' do
            default_setting = Course::Settings::AssessmentsComponent.
                              category_email_setting_items[:assessment_opening][:enabled_by_default]
            expect(subject).to eq(default_setting)
          end
        end
      end

      context 'when email setting key is invalid' do
        let(:key) { :unknown_key }

        it { expect { subject }.to raise_exception(ArgumentError) }
      end
    end

    describe '#update_email_setting' do
      let(:payload) do
        { 'key' => key, 'enabled' => false, 'options' => { 'category_id' => category.id } }
      end
      subject { settings.update_email_setting(payload) && course.save! }

      context 'when all arguments are valid' do
        let(:key) { :new_grading }
        before { subject }

        it 'persists the setting' do
          setting = Course::Settings::AssessmentsComponent.email_enabled?(category, key)
          expect(setting).to eq(payload['enabled'])
        end
      end

      context 'when an argument is invalid' do
        let(:key) { :unknown_key }

        it { expect { subject }.to raise_exception(ArgumentError) }
      end
    end

    describe '#email_settings' do
      subject { settings.email_settings }

      it 'returns setting items in the required shape' do
        expect(subject.length).
          to eq(Course::Settings::AssessmentsComponent.category_email_setting_items.length)
        expect(subject.last.keys).
          to contain_exactly(:component, :component_title, :enabled, :key, :options)
      end
    end
  end
end
