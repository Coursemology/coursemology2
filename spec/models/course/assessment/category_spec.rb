require 'rails_helper'

RSpec.describe Course::Assessment::Category do
  it { is_expected.to belong_to(:course) }
  it { is_expected.to have_many(:tabs) }
  it { is_expected.to have_many(:assessments).through(:tabs) }
end
