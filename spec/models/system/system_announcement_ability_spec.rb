require 'rails_helper'

RSpec.describe System::Announcement do
  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    subject { Ability.new(user) }
    let!(:not_started_system_announcement) { create(:system_announcement, :not_started) }
    let!(:ended_system_announcement) { create(:system_announcement, :ended) }
    let!(:valid_system_announcement) { create(:system_announcement) }

    context 'when the user is an Instance User' do
      let(:user) { create(:instance_user).user }

      it { is_expected.to be_able_to(:show, valid_system_announcement) }
      it { is_expected.to be_able_to(:show, ended_system_announcement) }
      it { is_expected.not_to be_able_to(:show, not_started_system_announcement) }
      it { is_expected.not_to be_able_to(:manage, valid_system_announcement) }
    end

    context 'when the user is an Instance Administrator' do
      let(:user) { create(:instance_administrator).user }

      it { is_expected.not_to be_able_to(:manage, valid_system_announcement) }
      it { is_expected.not_to be_able_to(:manage, ended_system_announcement) }
      it { is_expected.not_to be_able_to(:manage, not_started_system_announcement) }
    end

    context 'when the user is an Administrator' do
      let(:user) { create(:administrator) }

      it { is_expected.to be_able_to(:manage, valid_system_announcement) }
      it { is_expected.to be_able_to(:manage, ended_system_announcement) }
      it { is_expected.to be_able_to(:manage, not_started_system_announcement) }
    end
  end
end
