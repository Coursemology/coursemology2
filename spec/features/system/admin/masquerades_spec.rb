# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'System: Administration: Masquerade', js: true do
  include DeviseMasquerade::Controllers::UrlHelpers
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

        find(".user-masquerade-#{user_to_masquerade.id}").click
        wait_for_page

        expect(page).to have_text("Masquerading as #{user_to_masquerade.name}")
      end
    end

    context 'As an Instance Administrator' do
      let(:user) { create(:instance_user, role: :administrator).user }

      scenario 'I cannot masquerade a user' do
        visit admin_users_path

        expect_forbidden
      end
    end

    context 'As a Normal User' do
      let(:user) { create(:instance_user).user }

      scenario 'I cannot masquerade a user' do
        visit admin_users_path

        expect_forbidden
      end
    end
  end
end
