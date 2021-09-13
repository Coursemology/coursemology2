# frozen_string_literal: true
require 'rails_helper'

RSpec.describe User::OmniauthCallbacksController, type: :controller do
  let!(:instance) { Instance.default }
  # Note: Facebook login feature is currently disabled.
  before { skip }

  with_tenant(:instance) do
    before { controller.request.env['devise.mapping'] = Devise.mappings[:user] }

    describe '#facebook' do
      let(:facebook_data) { build(:omniauth_facebook) }
      before { controller.request.env['omniauth.auth'] = facebook_data }
      subject { get :facebook }

      context 'when required data is provided' do
        it 'creates a user identity' do
          subject
          identity = User::Identity.find_by(provider: facebook_data.provider,
                                            uid: facebook_data.uid)
          expect(identity).to be_present
        end

        it 'creates a user with the information from facebook' do
          subject
          user = controller.instance_variable_get(:@user)
          expect(user.name).to eq(facebook_data.info.name)
          expect(user.email).to eq(facebook_data.info.email)
          expect(user).to be_persisted
        end
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

        it 'shows an error message' do
          subject
          expect(flash[:danger]).to eq(I18n.t('user.omniauth_callbacks.facebook.sign_in_failure'))
        end
      end

      context 'when the user is signed in' do
        let(:user) { create(:user) }
        before { sign_in(user) }

        it 'shows an error message when omniauth data is incomplete' do
          facebook_data.uid = nil

          subject
          expect(flash[:danger]).to eq(I18n.t('user.omniauth_callbacks.facebook.failed'))
        end
      end
    end
  end
end
