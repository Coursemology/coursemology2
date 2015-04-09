require 'rails_helper'

RSpec.describe Course::GroupUser, type: :model do
  it { is_expected.to belong_to(:user).inverse_of(:course_group_users) }
  it { is_expected.to belong_to(:course_group).inverse_of(:group_users) }
end
