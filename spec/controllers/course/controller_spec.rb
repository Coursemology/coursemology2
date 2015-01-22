require 'rails_helper'

RSpec.describe Course::Controller, type: :controller do
  describe '#sidebar' do
    it 'returns an empty array when no modules included' do
      allow(Course::CoursesController).to receive(:modules).and_return([])
      expect(controller.sidebar).to eq([])
    end
  end

  describe '#settings' do
    it 'returns an empty array when no modules included' do
      allow(Course::CoursesController).to receive(:modules).and_return([])
      expect(controller.settings).to eq([])
    end
  end
end
