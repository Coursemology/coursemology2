require 'rails_helper'

RSpec.describe Course::Requirement, type: :model do
  it { is_expected.to be_actable }
  it { is_expected.to belong_to(:has_requirement) }
end
