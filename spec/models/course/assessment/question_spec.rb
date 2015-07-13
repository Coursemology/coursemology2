require 'rails_helper'

RSpec.describe Course::Assessment::Question do
  it { is_expected.to be_actable }
  it { is_expected.to belong_to(:assessment) }
  it { is_expected.to have_and_belong_to_many(:tags) }
end
