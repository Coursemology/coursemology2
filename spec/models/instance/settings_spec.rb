require 'rails_helper'

RSpec.describe Instance::Settings, type: :model do
  ALL_COMPONENTS = [:A, :B, :C, :D, :E, :F]
  ENABLED_COMPONENTS = [:A, :C, :E]

  let(:settings) do
    components = {}
    ALL_COMPONENTS.each do |component|
      components[component] ||= { enabled: ENABLED_COMPONENTS.include?(component) }
    end
    hash = { components: components }
    mock_settings(hash)
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
