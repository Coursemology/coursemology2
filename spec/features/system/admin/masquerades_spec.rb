# frozen_string_literal: true
require 'rails_helper'
include DeviseMasquerade::Controllers::UrlHelpers

RSpec.feature 'System: Administration: Masquerade' do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let!(:user_to_masquerade) do
      create(:user)
      User.human_users.ordered_by_name.first
    end
    before { login_as(user, scope: :user) }

    context 'As a System Administrator' do
      let(:user) { create(:administrator) }

      scenario 'I can masquerade a user' do
        visit admin_users_path

        find_link(nil, href: /\/users\/masquerade\/#{user_to_masquerade.id}.*/).click

        expect(page).to have_selector('li', text: user_to_masquerade.name)
      end
    end

    context 'As an Instance Administrator' do
      let(:user) { create(:instance_user, role: :administrator).user }

      scenario 'I cannot masquerade a user' do
        visit masquerade_path(user_to_masquerade)

        expect(page).not_to have_selector('li', text: user_to_masquerade.name)
        expect(page).to have_selector('div', text: 'pages.403.header')
      end
    end

    context 'As a Normal User' do
      let(:user) { create(:instance_user).user }

      scenario 'I cannot masquerade a user' do
        visit masquerade_path(user_to_masquerade)

        expect(page).not_to have_selector('li', text: user_to_masquerade.name)
        expect(page).to have_selector('div', text: 'pages.403.header')
      end
    end
  end
end
