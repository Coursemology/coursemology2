require 'rails_helper'

RSpec.describe Course::ControllerComponentHost::Component do
  class self::DummyComponent
    include Course::ControllerComponentHost::Component

    def initialize(*)
    end
  end

  context 'when a class first includes the module' do
    subject { self.class::DummyComponent.new }
    it 'has an empty sidebar ' do
      expect(subject.sidebar_items).to eq([])
    end

    it 'is enabled' do
      expect(subject.enabled_by_default?).to be(true)
    end

    it 'has a generated key' do
      expect(subject.key).to be_a(Symbol)
      expect(subject.key.to_s).to match(/dummy_component$/)
    end
  end
end
