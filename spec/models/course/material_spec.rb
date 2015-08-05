require 'rails_helper'

RSpec.describe Course::Material, type: :model do
  it { is_expected.to belong_to(:creator) }
  it { is_expected.to have_many(:attachments) }
end
