# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Users: Sign In with Token' do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:user) { build(:user) }
    context 'when a user token is specified in the HTTP headers' do
      it 'allows users to sign in with a user token' do
        user.enable_token_authentication
        user.save!

        get root_path, nil, 'x-user-email' => user.email,
                            'x-user-token' => user.authentication_token

        expect(response.body).to have_tag('a', text: I18n.t('layout.navbar.sign_out'))
      end
    end

    context 'when a user token is specified as a parameter' do
      it 'does not allow the user to sign in' do
        user.enable_token_authentication
        user.save!

        get root_path, 'user_email' => user.email,
                       'user_token' => user.authentication_token

        expect(response.body).to have_tag('a', text: I18n.t('layout.navbar.sign_in'))
      end
    end

    context 'when a user does not have token authentication' do
      it 'does not allow the user to sign in' do
        user.disable_token_authentication
        user.save!

        get root_path, 'user_email' => user.email,
                       'user_token' => user.authentication_token

        expect(response.body).to have_tag('a', text: I18n.t('layout.navbar.sign_in'))
      end
    end
  end
end
