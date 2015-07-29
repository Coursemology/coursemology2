require 'rails_helper'

RSpec.describe User::OmniauthCallbacksController, type: :controller do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    before { controller.request.env['devise.mapping'] = Devise.mappings[:user] }

    describe '#facebook' do
      let(:facebook_data) { OmniAuth.config.mock_auth[:facebook].dup }
      before { controller.request.env['omniauth.auth'] = facebook_data }
      subject { get :facebook }

      it 'creates a user identity' do
        subject
        identity = User::Identity.find_by(provider: facebook_data.provider, uid: facebook_data.uid)
        expect(identity).to be_present
      end

      it 'creates a user with the information from facebook' do
        subject
        user = controller.instance_variable_get(:@user)
        expect(user.name).to eq(facebook_data.info.name)
        expect(user.email).to eq(facebook_data.info.email)
        expect(user).to be_persisted
      end

      context 'when the data provided is incomplete' do
        before do
          facebook_data.info.email = nil
        end

        it 'does not create any user' do
          subject
          user = controller.instance_variable_get(:@user)
          expect(user).not_to be_persisted
          expect(user.name).to eq(facebook_data.info.name)
          expect(user.email).to be_nil
        end

        it { is_expected.to redirect_to(new_user_registration_path) }
      end
    end
  end
end
