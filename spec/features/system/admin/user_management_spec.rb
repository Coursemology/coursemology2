# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'System: Administration: Users', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    context 'As a System Administrator' do
      let(:admin) { create(:administrator) }
      before { login_as(admin, scope: :user) }

      let!(:users) do
        create_list(:user, 2)
        User.human_users.ordered_by_name.limit(5)
      end
      scenario 'I can view the users in the system' do
        visit admin_users_path

        users.each do |user|
          expect(page).to have_selector('div.user_name', text: user.name)
          expect(page).to have_selector('p.user_email', text: user.email)
        end
      end

      scenario 'I can filter users by role and view only administrators' do
        visit admin_users_path(role: :administrator)

        User.human_users.normal.ordered_by_name.limit(3).each do |user|
          expect(page).to have_no_selector('div.user_name', exact_text: user.name)
          expect(page).to have_no_selector('p.user_email', exact_text: user.email)
        end

        User.human_users.administrator.ordered_by_name.limit(3).each do |user|
          expect(page).to have_selector('div.user_name', exact_text: user.name)
          expect(page).to have_selector('p.user_email', exact_text: user.email)
        end
      end

      scenario "I can change a user's record", js: true do
        visit admin_users_path

        user_to_change = users.sample
        new_name = 'updated user name'

        # change name
        within find("tr.system_user_#{user_to_change.id}") do
          find('button.inline-edit-button', visible: false).click
          find('input').set(new_name)
          find('button.confirm-btn').click
        end
        expect_toastify("#{user_to_change.name} was renamed to #{new_name}.")

        # change role
        within find("tr.system_user_#{user_to_change.id}") do
          find('div.user_role').click
        end
        find("#role-#{user_to_change.id}-administrator").select_option
        expect_toastify("Successfully changed #{new_name}'s role to Administrator.")

        expect(user_to_change.reload).to be_administrator
        expect(user_to_change.name).to eq(new_name)
      end

      let!(:user_to_delete) { create(:user, name: "!#{users.first.name}") }
      scenario 'I can delete a user' do
        visit admin_users_path

        find("button.user-delete-#{user_to_delete.id}").click
        accept_confirm_dialog
        expect_toastify('User was deleted.')
      end

      scenario 'I can search users' do
        user_name = SecureRandom.hex
        users_to_search = create_list(:user, 2, name: user_name)
        visit admin_users_path

        # Search by username
        find('button[aria-label="Search"]').click
        find('div[aria-label="Search"]').find('input').set(user_name)

        sleep 0.5 # timeout for search debouncing
        users_to_search.each do |user|
          expect(page).to have_selector('div.user_name', text: user.name)
        end
        expect(all('.system_user').count).to eq(2)

        # Search by email
        random_user = users_to_search.sample
        find('div[aria-label="Search"]').find('input').set(random_user.email)
        sleep 0.5 # timeout for search debouncing

        expect(page).to have_selector('div.user_name', text: random_user.name)
        expect(all('.system_user').count).to eq(1)
      end
    end
  end
end
