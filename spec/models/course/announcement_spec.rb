require 'rails_helper'

RSpec.describe Course::Announcement, type: :model do
	it { should belong_to(:creator).class_name(User.name) }
	it { should belong_to(:course).inverse_of(:announcements) }

  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    context 'when title is not present' do
      subject { build(:course_announcement, title: '') }

      it { is_expected.not_to be_valid }
    end
  end
end