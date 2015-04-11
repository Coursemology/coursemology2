require 'rails_helper'

RSpec.describe Course::LessonPlanItem, type: :model do
  it { is_expected.to validate_numericality_of(:base_exp).only_integer }
  it { is_expected.to validate_numericality_of(:time_bonus_exp).only_integer }
  it { is_expected.to validate_numericality_of(:extra_bonus_exp).only_integer }
end
