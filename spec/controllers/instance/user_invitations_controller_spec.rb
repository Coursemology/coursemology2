# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Instance::UserInvitationsController, type: :controller do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:instance_admin) { create(:instance_user, role: :administrator).user }
    let(:normal_user) { create(:user) }

    describe '#create' do
      let(:invite_params) do
        invitation = { name: generate(:name), email: generate(:email) }
        { user_invitation: invitation }
      end

      subject { post :create, params: invite_params }

      context 'when a normal user visits the page' do
        before { sign_in(normal_user) }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when an instance administrator visits the page' do
        before { sign_in(instance_admin) }

        it { is_expected.to redirect_to admin_instance_users_path }
      end
    end
  end
end
