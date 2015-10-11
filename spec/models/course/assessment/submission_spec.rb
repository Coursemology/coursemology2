require 'rails_helper'

RSpec.describe Course::Assessment::Submission do
  it { is_expected.to belong_to(:assessment) }
  it { is_expected.to have_many(:answers) }
  it { is_expected.to accept_nested_attributes_for(:answers) }
end
