require 'rails_helper'

RSpec.describe Instance::Settings, type: :model do
  class Component
    attr_accessor :key

    def initialize(key)
      @key = key
    end
  end

  ALL_COMPONENTS = [:A, :B, :C, :D, :E, :F].map { |key| Component.new(key) }
  ENABLED_COMPONENTS = [:A, :C, :E].map { |key| Component.new(key) }

  let(:settings) do
    class MockSettings
      def stub_method(name, &block)
        (class << self; self; end).class_eval do
          define_method(name, &block)
        end
      end
    end

    component_settings = Struct.new(:enabled)
    components_settings = MockSettings.new
    component_settings_store = HashWithIndifferentAccess.new
    components_settings.stub_method(:settings) do |symbol|
      enabled = ENABLED_COMPONENTS.map(&:key).include?(symbol.to_sym)
      component_settings_store[symbol] ||= component_settings.new(enabled)
    end
    components_settings.stub_method(:map) do |&block|
      ALL_COMPONENTS.map { |component| [component.key, settings(symbol.key)] }.map(&block)
    end
    instance_settings = MockSettings.new
    instance_settings.stub_method(:settings) do |_|
      components_settings
    end

    instance_settings
  end

  subject { Instance::Settings.new(settings, ALL_COMPONENTS) }

  describe 'mocks' do
    it 'has many components' do
      expect(subject.send(:settings, :components).settings(:A).enabled).to be_truthy
      expect(subject.send(:settings, :components).settings(:B).enabled).to be_falsey
    end
  end

  describe '#enabled_components' do
    it 'retrieves only enabled components' do
      enabled_component_ids = subject.enabled_components.map { |c| c.id.to_sym }
      expect(enabled_component_ids).to contain_exactly(*(ENABLED_COMPONENTS.map(&:key)))
    end
  end

  describe '#enabled_component_ids' do
    it 'retrieves only enabled components' do
      expected_ids = ENABLED_COMPONENTS.map { |c| c.key.to_s }
      expect(subject.enabled_component_ids).to contain_exactly(*expected_ids)
    end
  end

  describe '#enabled_component_ids=' do
    it 'sets the enabled components' do
      new_enabled_components = ENABLED_COMPONENTS + [Component.new(:B)]
      expected_ids = new_enabled_components.map { |c| c.key.to_s }
      subject.enabled_component_ids = new_enabled_components.map { |c| c.key.to_s }
      expect(subject.enabled_component_ids).to contain_exactly(*expected_ids)
    end
  end
end
