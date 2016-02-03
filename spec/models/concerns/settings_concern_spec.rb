# frozen_string_literal: true
require 'rails_helper'

RSpec.describe SettingsConcern, type: :model do
  let(:all_components) { [:A, :B, :C, :D, :E, :F].freeze }
  let(:enabled_components) { [:A, :C, :E].freeze }
  let(:settings) do
    components = {}
    all_components.each do |component|
      components[component] ||= { enabled: enabled_components.include?(component) }
    end
    hash = { components: components }
    mock_settings(hash)
  end

  let(:test_class) do
    Class.new do
      include SettingsConcern

      def initialize(settings)
        @settings = settings
      end
    end
  end

  subject { test_class.new(settings) }

  describe '#enabled_components' do
    it 'retrieves only enabled components' do
      enabled_component_ids = subject.enabled_components.map(&:id)
      expect(enabled_component_ids).to contain_exactly(*enabled_components)
    end
  end

  describe '#enabled_component_ids' do
    it 'retrieves only enabled components' do
      expect(subject.enabled_component_ids).to contain_exactly(*enabled_components)
    end
  end

  describe '#enabled_component_ids=' do
    it 'sets the enabled components' do
      new_enabled_components = enabled_components + [:B]
      subject.enabled_component_ids = new_enabled_components
      expect(subject.enabled_component_ids).to contain_exactly(*new_enabled_components)
    end
  end
end
