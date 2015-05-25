require 'rails_helper'

RSpec.describe Instance::Settings, type: :model do
  ALL_COMPONENTS = [:A, :B, :C, :D, :E, :F]
  ENABLED_COMPONENTS = [:A, :C, :E]

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
    component_settings_store = {}
    components_settings.stub_method(:settings) do |symbol|
      enabled = ENABLED_COMPONENTS.include?(symbol)
      component_settings_store[symbol] ||= component_settings.new(enabled)
    end
    components_settings.stub_method(:map) do |&block|
      ALL_COMPONENTS.map { |symbol| [symbol, settings(symbol)] }.map(&block)
    end
    instance_settings = MockSettings.new
    instance_settings.stub_method(:settings) do |_|
      components_settings
    end

    instance_settings
  end

  subject { Instance::Settings.new(settings) }

  describe 'mocks' do
    it 'has many components' do
      expect(subject.send(:settings, :components).settings(:A).enabled).to be_truthy
      expect(subject.send(:settings, :components).settings(:B).enabled).to be_falsey
    end
  end

  describe '#enabled_components' do
    it 'retrieves only enabled components' do
      enabled_component_ids = subject.enabled_components.map(&:id)
      expect(enabled_component_ids).to contain_exactly(*ENABLED_COMPONENTS)
    end
  end

  describe '#enabled_component_ids' do
    it 'retrieves only enabled components' do
      expect(subject.enabled_component_ids).to contain_exactly(*ENABLED_COMPONENTS)
    end
  end

  describe '#enabled_component_ids=' do
    it 'sets the enabled components' do
      new_enabled_components = ENABLED_COMPONENTS + [:B]
      subject.enabled_component_ids = new_enabled_components
      expect(subject.enabled_component_ids).to contain_exactly(*new_enabled_components)
    end
  end
end
