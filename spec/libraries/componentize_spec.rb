require 'rails_helper'

RSpec.describe Componentize do
  context 'When included in a class' do
    before do
      class Componentize1
        include Componentize
      end

      class Component1
        include Componentize1::Component
      end
    end

    it 'has a list of components' do
      expect(Componentize1.components).to be_kind_of(Array)
    end

    it 'has a module base' do
      expect(Componentize1::Component).to be_kind_of(Module)
    end

    it 'can have components associated' do
      expect(Componentize1.components).to include(Component1)
    end

    it 'is only included once' do
      Object.send(:remove_const, :Component1)
      class Component1
        include Componentize1::Component
      end

      expect(Componentize1.components).to eq(Componentize1.components.uniq)
    end

    it 'eager loads all components in a directory' do
      Componentize1.eager_load_components(Dir.new("#{__dir__}/../fixtures/libraries/componentize"))
      expect(Componentize1.components).to include(TestComponent)
    end

    it 'eager loads all components in a directory path' do
      Componentize1.eager_load_components("#{__dir__}/../fixtures/libraries/componentize")
      expect(Componentize1.components).to include(TestComponent)
    end
  end

  context 'When there are multiple hosts' do
    before do
      class Componentize2
        include Componentize
      end

      class Componentize3
        include Componentize
      end

      class Component2
        include Componentize2::Component
      end
    end

    it 'has a unique set of components per host' do
      expect(Componentize2.components).to_not eq(Componentize3.components)
    end
  end
end
