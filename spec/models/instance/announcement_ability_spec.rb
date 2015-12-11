require 'rails_helper'

RSpec.describe Instance::Announcement do
  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    subject { Ability.new(user) }
    let(:course) { create(:course) }
    let!(:not_started_announcement) { create(:instance_announcement, :not_started) }
    let!(:ended_announcement) { create(:instance_announcement, :ended) }
    let!(:valid_announcement) { create(:instance_announcement) }

    context 'when the user is a Instance User' do
      let(:user) { create(:instance_user).user }

      it { is_expected.to be_able_to(:show, valid_announcement) }
      it { is_expected.to be_able_to(:show, ended_announcement) }
      it { is_expected.not_to be_able_to(:show, not_started_announcement) }
      it { is_expected.not_to be_able_to(:manage, valid_announcement) }

      it 'sees the started announcements' do
        expect(instance.announcements.accessible_by(subject)).
          to contain_exactly(valid_announcement, ended_announcement)
      end
    end

    context 'when the user is a Instance Administrator' do
      let(:user) { create(:instance_administrator).user }

      it { is_expected.to be_able_to(:manage, valid_announcement) }
      it { is_expected.to be_able_to(:manage, ended_announcement) }
      it { is_expected.to be_able_to(:manage, not_started_announcement) }

      it 'sees all announcements' do
        expect(instance.announcements.accessible_by(subject)).
          to contain_exactly(not_started_announcement, valid_announcement, ended_announcement)
      end
    end
  end
end
