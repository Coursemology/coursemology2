# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'System: Administration: Instance: Users', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:instance_admin) { create(:instance_user, role: :administrator).user }
    let!(:prefix) { "testadm-#{rand(36**12).to_s(36)}-usr-" }
    let!(:instance_users) do
      (1..2).map do |i|
        create(:instance_user, user_name: "#{prefix}#{i}")
      end
    end

    # For certain tests, use the search box to only show the users we created for this test.
    # This is to prevent tests failing if there are so many users such that
    # the ones created for this test aren't on the first page.
    def search_for_users(query, click: true)
      within find('div[aria-label="Table Toolbar"]') do
        find('button[aria-label="Search"]').click if click
        find('input[type="text"]').set('').native.send_keys(query)
      end
    end

    context 'As a Instance Administrator' do
      before { login_as(instance_admin, scope: :user) }

      scenario 'I can view all users in the instance' do
        visit admin_instance_users_path

        search_for_users(prefix)
        instance_users.each do |instance_user|
          expect(page).to have_text(instance_user.user.name)
          expect(page).to have_selector('p.user_email', text: instance_user.user.email)
        end
      end

      scenario 'I can filter users by role and view only administrators' do
        visit admin_instance_users_path

        within find('p', text: 'Total Users', exact_text: false) do
          find_all('a').first.click
        end

        instance_users.each do |instance_user|
          expect(page).not_to have_text(instance_user.user.name)
          expect(page).to have_no_selector('p.user_email', exact_text: instance_user.user.email)
        end

        expect(page).to have_text(instance_admin.name)
        expect(page).to have_selector('p.user_email', exact_text: instance_admin.email)
      end

      scenario "I can change a user's role" do
        visit admin_instance_users_path

        user_to_change = instance_users.sample
        search_for_users(user_to_change.user.name)

        within find("tr.instance_user_#{user_to_change.id}") do
          find('div.user_role').click
        end
        find("#role-#{user_to_change.id}-administrator").select_option
        expect_toastify("Successfully changed #{user_to_change.user.name}'s role to Administrator.")

        expect(user_to_change.reload).to be_administrator
      end

      scenario 'I can delete a user' do
        visit admin_instance_users_path

        search_for_users(prefix)
        user_to_delete = instance_users.sample
        find("button.user-delete-#{user_to_delete.id}").click
        accept_prompt
        expect_toastify('User was deleted.')
      end

      # Generate new users to search so it doesn't conflict with above scenarios
      scenario 'I can search users' do
        search_prefix = "testadm-search-#{rand(36**12).to_s(36)}-usr-"
        instance_users_to_search = (1..2).map do |i|
          create(:instance_user, user_name: "#{search_prefix}#{i}")
        end

        visit admin_instance_users_path

        # Search by username
        search_for_users(search_prefix)

        instance_users_to_search.each do |instance_user|
          expect(page).to have_text(instance_user.user.name)
        end
        expect(page).to have_selector('.instance_user', count: 2)

        # Search by email
        random_instance_user = InstanceUser.order('RANDOM()').first
        search_for_users(random_instance_user.user.email, click: false)

        expect(page).to have_text(random_instance_user.user.name)
        expect(page).to have_selector('.instance_user', count: 1)
      end
    end
  end
end
