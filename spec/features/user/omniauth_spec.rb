# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'User: Omniauth' do
  let(:instance) { Instance.default }
  # Note: Facebook login feature is currently disabled.
  before { skip }

  with_tenant(:instance) do
    context 'As a unregistered user' do
      scenario 'I can sign in with facebook' do
        visit new_user_session_path

        expect do
          click_link 'Facebook'
        end.to change(instance.instance_users, :count).by(1)

        expect(page).to have_link(nil, href: destroy_user_session_path)
        expect(page).not_to have_link(nil, href: new_user_session_path)
        expect(page).to have_selector('div', text: I18n.t('user.success'))
      end
    end
  end
end
