# frozen_string_literal: true
require 'rails_helper'

RSpec.describe User::RegistrationsController, type: :controller do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    describe '#create' do
      subject do
        valid_user = attributes_for(:user).reverse_merge(email: generate(:email))
        post :create, params: {
          user: {
            name: valid_user[:name],
            email: valid_user[:email],
            password: valid_user[:password],
            password_confirmation: valid_user[:password]
          }
        }
      end

      context 'user registration is successful' do
        before do
          @request.env['devise.mapping'] = Devise.mappings[:user]
        end

        it 'creates a new account' do
          allow(controller).to receive(:verify_recaptcha).and_return(true)
          expect { subject }.to change { User.count }.by(1)
        end
      end

      context 'recaptcha is not validated' do
        before do
          @request.env['devise.mapping'] = Devise.mappings[:user]
        end

        it 'does not register any new users' do
          allow(controller).to receive(:verify_recaptcha).and_return(false)
          expect { subject }.to change { User.count }.by(0)
        end
      end
    end
  end
end
