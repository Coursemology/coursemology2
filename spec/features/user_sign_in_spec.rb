# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Users: Sign In' do
  let(:instance) { Instance.default }
  let(:other_instance) { create(:instance) }
  let(:password) { '12345678' }

  with_tenant(:instance) do
    context 'As a user from another instance' do
      let(:user) do
        user = nil
        ActsAsTenant.with_tenant(other_instance) do
          user = create(:user, password: password)
        end
        user
      end

      scenario 'I can sign in to current instance' do
        visit new_user_session_path
        fill_in 'user_email', with: user.email
        fill_in 'user_password', with: user.password

        expect do
          click_button I18n.t('user.sessions.new.sign_in')
        end.to change { instance.instance_users.exists?(user: user) }.from(false).to(true)
      end

      context 'As a system administrator' do
        let(:user) do
          user = nil
          ActsAsTenant.with_tenant(other_instance) do
            user = create(:administrator, password: password)
          end
          user
        end

        scenario 'I can sign in to current instance' do
          visit new_user_session_path
          fill_in 'user_email', with: user.email
          fill_in 'user_password', with: password

          click_button I18n.t('user.sessions.new.sign_in')
          expect(page).to have_selector('div.alert', text: I18n.t('user.signed_in'))
          expect(instance.instance_users.exists?(user: user)).to be_falsy
        end
      end
    end
  end
end
