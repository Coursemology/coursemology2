require 'rails_helper'

RSpec.describe Course::Level, type: :model do
  it { is_expected.to belong_to(:course).inverse_of(:levels) }
  it do
    is_expected.to validate_numericality_of(:experience_points_threshold).
      is_greater_than(0).is_less_than(2_147_483_647)
  end

  context 'before level_number is set' do
    it 'raises' do
      expect { Course::Level.new.level_number }.to raise_error
    end
  end
end
