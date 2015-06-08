require 'rails_helper'

RSpec.describe EffectiveSettingsConcern, type: :model do
  let(:settings) do
    mock_settings(components: {
      A: { enabled: true }
    })
  end

  let(:component_host) { Course::ComponentHost }
  let(:default_enabled_components) do
    component_host.components.select(&:enabled_by_default?)
  end
  let(:default_enabled_component_ids) { default_enabled_components.map { |c| c.key.to_s } }

  let(:parent_class) do
    Class.new do
      include SettingsConcern

      def initialize(settings)
        @settings = settings
      end
    end
  end

  let(:test_class) do
    Class.new(parent_class) do
      include EffectiveSettingsConcern

      def initialize(settings, component_host)
        super(settings)
        @component_host = component_host
      end
    end
  end

  subject { test_class.new(settings, component_host) }

  describe '#enabled_component_ids' do
    context 'when no configuration is defined' do
      it 'falls back to the defaults' do
        expect(subject.enabled_component_ids).to include(*default_enabled_component_ids)
      end

      it 'does not contain removed components' do
        expect(subject.enabled_component_ids).to contain_exactly(*default_enabled_component_ids)
      end
    end
  end
end
