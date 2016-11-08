# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Condition::ConditionsHelper do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    before(:each) do
      # This is to mock a Course::ComponentController
      test = self
      controller.define_singleton_method(:current_course) { test.course }
      helper.singleton_class.class_eval do
        delegate :current_course, :current_component_host, to: :controller
      end
    end

    describe '#component_enabled?' do
      before do
        controller.define_singleton_method(:current_component_host) do
          {
            course_achievements_component: 'enabled',
            course_levels_component: nil
          }
        end
      end
      subject { helper.component_enabled?(class_name) }

      context 'when component is enabled' do
        let(:class_name) { Course::Condition::Achievement.name }
        it { is_expected.to be_truthy }
      end

      context 'when component is disabled' do
        let(:class_name) { Course::Condition::Level.name }
        it { is_expected.to be_falsey }
      end
    end
  end
end
