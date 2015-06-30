require 'rails_helper'

RSpec.feature 'Users: Sign In' do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    scenario 'I can sign in if I am a user in another instance' do
      other_instance = create(:instance)
      password = 'abcdefghi'
      user = create(:user, password: password)
      ActsAsTenant.with_tenant(other_instance) do
        other_instance.instance_users.create(user: user)
      end

      visit new_user_session_path
      fill_in 'user_email', with: user.email
      fill_in 'user_password', with: user.password

      expect do
        click_button I18n.t('user.sessions.new.sign_in')
      end.to change { instance.instance_users.exists?(user: user) }.from(false).to(true)
    end
  end
end
