require 'rails_helper'

RSpec.describe Course::Controller, type: :controller do
  describe '#sidebar' do
    it 'returns an empty array when no components included' do
      allow(Course::ComponentHost).to receive(:components).and_return([])
      expect(controller.sidebar).to eq([])
    end
  end

  describe '#settings' do
    it 'returns an empty array when no components included' do
      allow(Course::ComponentHost).to receive(:components).and_return([])
      expect(controller.settings).to eq([])
    end
  end
end
