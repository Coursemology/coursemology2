require 'rails_helper'

RSpec.describe Course::Assessment::Tab do
  it { is_expected.to belong_to(:category) }
  it { is_expected.to have_many(:assessments) }
end
