# frozen_string_literal: true
require 'rails_helper'

RSpec.describe GenericAnnouncement do
  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    subject { Ability.new(user) }
    let!(:not_started_system_announcement) do
      GenericAnnouncement.find(create(:system_announcement, :not_started).id)
    end
    let!(:ended_system_announcement) do
      GenericAnnouncement.find(create(:system_announcement, :ended).id)
    end
    let!(:valid_system_announcement) do
      GenericAnnouncement.find(create(:system_announcement).id)
    end

    let!(:not_started_instance_announcement) do
      GenericAnnouncement.find(create(:instance_announcement, :not_started).id)
    end
    let!(:ended_instance_announcement) do
      GenericAnnouncement.find(create(:instance_announcement, :ended).id)
    end
    let!(:valid_instance_announcement) do
      GenericAnnouncement.find(create(:instance_announcement).id)
    end

    context 'when the user is an Instance User' do
      let(:user) { create(:instance_user).user }

      it { is_expected.to be_able_to(:show, valid_system_announcement) }
      it { is_expected.to be_able_to(:show, ended_system_announcement) }
      it { is_expected.not_to be_able_to(:show, not_started_system_announcement) }

      it { is_expected.to be_able_to(:show, valid_instance_announcement) }
      it { is_expected.to be_able_to(:show, ended_instance_announcement) }
      it { is_expected.not_to be_able_to(:show, not_started_instance_announcement) }
    end

    context 'when the user is an Instance Administrator' do
      let(:user) { create(:instance_administrator).user }

      it { is_expected.not_to be_able_to(:manage, valid_system_announcement) }
      it { is_expected.not_to be_able_to(:manage, ended_system_announcement) }
      it { is_expected.not_to be_able_to(:manage, not_started_system_announcement) }

      it { is_expected.to be_able_to(:manage, valid_instance_announcement) }
      it { is_expected.to be_able_to(:manage, not_started_instance_announcement) }
      it { is_expected.to be_able_to(:manage, ended_instance_announcement) }
    end

    context 'when the user is an Administrator' do
      let(:user) { create(:administrator) }

      it { is_expected.to be_able_to(:manage, valid_system_announcement) }
      it { is_expected.to be_able_to(:manage, ended_system_announcement) }
      it { is_expected.to be_able_to(:manage, not_started_system_announcement) }

      it { is_expected.to be_able_to(:manage, valid_instance_announcement) }
      it { is_expected.to be_able_to(:manage, not_started_instance_announcement) }
      it { is_expected.to be_able_to(:manage, ended_instance_announcement) }
    end
  end
end
