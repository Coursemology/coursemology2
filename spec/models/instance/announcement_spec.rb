require 'rails_helper'

RSpec.describe Instance::Announcement, type: :model do
  it { is_expected.to belong_to(:creator).class_name(User.name) }
  it { is_expected.to belong_to(:instance).inverse_of(:announcements) }
  it { is_expected.to validate_presence_of(:title) }
end
