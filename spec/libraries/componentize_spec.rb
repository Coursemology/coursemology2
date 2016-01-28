# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Componentize do
  context 'when included in a class' do
    class self::ComponentHost
      include Componentize
    end

    class self::Component1
      include RSpec::ExampleGroups::Componentize::WhenIncludedInAClass::ComponentHost::Component
    end

    it 'has a list of components' do
      expect(self.class::ComponentHost.components).to be_kind_of(Array)
    end

    it 'has a module base' do
      expect(self.class::ComponentHost::Component).to be_kind_of(Module)
    end

    it 'can have components associated' do
      expect(self.class::ComponentHost.components).to include(self.class::Component1)
    end

    it 'is only included once' do
      self.class.send(:remove_const, :Component1)
      class self.class::Component1
        include RSpec::ExampleGroups::Componentize::WhenIncludedInAClass::ComponentHost::Component
      end

      expect(self.class::ComponentHost.components).to eq(self.class::ComponentHost.components.uniq)
    end

    it 'eager loads all components in a directory' do
      self.class::ComponentHost.eager_load_components(
        Dir.new("#{__dir__}/../fixtures/libraries/componentize"))
      expect(self.class::ComponentHost.components).to include(TestComponent)
    end

    it 'eager loads all components in a directory path' do
      self.class::ComponentHost.eager_load_components(
        "#{__dir__}/../fixtures/libraries/componentize")
      expect(self.class::ComponentHost.components).to include(TestComponent)
    end
  end

  context 'when there are multiple hosts' do
    class self::ComponentHost1
      include Componentize
    end

    class self::ComponentHost2
      include Componentize
    end

    class self::Component2
      include RSpec::ExampleGroups::Componentize::WhenThereAreMultipleHosts::
        ComponentHost2::Component
    end

    it 'has a unique set of components per host' do
      expect(self.class::ComponentHost1.components).to_not eq(self.class::ComponentHost2.components)
    end
  end
end
