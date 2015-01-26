require 'rails_helper'

RSpec.describe Course::Announcement, type: :model do
  it { is_expected.to belong_to(:creator).class_name(User.name) }
  it { is_expected.to belong_to(:course).inverse_of(:announcements) }
  it { is_expected.to validate_presence_of(:title) }

  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    context 'when announcement is created' do
      subject { Course::Announcement.new }

      it { is_expected.not_to be_sticky }
    end

    context 'when title is not present' do
      subject { build(:course_announcement, title: '') }

      it { is_expected.not_to be_valid }
    end
  end
end
