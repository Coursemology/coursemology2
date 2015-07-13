require 'rails_helper'

RSpec.describe Course::Assessment::Answer do
  it { is_expected.to be_actable }
  it { is_expected.to belong_to(:submission) }
  it { is_expected.to belong_to(:question) }
end
