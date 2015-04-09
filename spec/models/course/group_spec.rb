require 'rails_helper'

RSpec.describe Course::Group, type: :model do
  it { is_expected.to belong_to(:course).inverse_of(:groups) }
  it { is_expected.to have_many(:group_users).inverse_of(:course_group).dependent(:destroy) }
  it { is_expected.to have_many(:users).through(:group_users) }
end
