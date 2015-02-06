require 'rails_helper'

RSpec.describe Course::Level, type: :model do
  it { is_expected.to belong_to(:course).inverse_of(:levels) }
  it { is_expected.to validate_numericality_of(:experience_points_threshold).is_greater_than(0) }
end
