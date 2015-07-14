require 'rails_helper'

RSpec.describe Course::Assessment do
  it { is_expected.to act_as(:lesson_plan_item) }
  it { is_expected.to belong_to(:tab) }
  it { is_expected.to have_many(:questions) }
  it { is_expected.to have_many(:submissions) }
end
