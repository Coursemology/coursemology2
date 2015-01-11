require 'rails_helper'

RSpec.describe Modular do
  context 'When included in a class' do
    before do
      class Modular1
        include Modular
      end

      class Module1
        include Modular1::Module
      end
    end

    it 'has a list of modules' do
      expect(Modular1.modules).to be_kind_of(Array)
    end

    it 'has a module base' do
      expect(Modular1::Module).to be_kind_of(Module)
    end

    it 'can have modules associated' do
      expect(Modular1.modules).to include(Module1)
    end

    it 'is only included once' do
      Object.send(:remove_const, :Module1)
      class Module1
        include Modular1::Module
      end

      expect(Modular1.modules).to eq(Modular1.modules.uniq)
    end

    it 'eager loads all modules in a directory' do
      Modular1.eager_load_modules(Dir.new("#{__dir__}/../fixtures/libraries/modular"))
      expect(Modular1.modules).to include(TestModule)
    end
  end

  context 'When there are multiple hosts' do
    before do
      class Modular2
        include Modular
      end

      class Modular3
        include Modular
      end

      class Module2
        include Modular2::Module
      end
    end

    it 'has a unique set of modules per host' do
      expect(Modular2.modules).to_not eq(Modular3.modules)
    end
  end
end
