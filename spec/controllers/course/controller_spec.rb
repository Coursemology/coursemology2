require 'rails_helper'

RSpec.describe Course::Controller, type: :controller do
  describe '#sidebar' do
    it 'returns an empty array when no modules included' do
      allow(Course::CoursesController).to receive(:modules).and_return([])
      expect(controller.sidebar).to eq([])
    end
  end
end
