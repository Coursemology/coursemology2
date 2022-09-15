# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'System: Administration: Instance: Users', js: true do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:instance_admin) { create(:instance_user, role: :administrator).user }
    let!(:instance_users) { create_list(:instance_user, 2) }

    context 'As a Instance Administrator' do
      before { login_as(instance_admin, scope: :user) }

      scenario 'I can view all users in the instance' do
        visit admin_instance_users_path

        instance_users.each do |instance_user|
          expect(page).to have_selector('div.user_name', text: instance_user.user.name)
          expect(page).to have_selector('p.user_email', text: instance_user.user.email)
        end
      end

      scenario 'I can filter users by role and view only administrators' do
        visit admin_instance_users_path(role: :administrator)

        instance_users.each do |instance_user|
          expect(page).to have_no_selector('div.user_name', exact_text: instance_user.user.name)
          expect(page).to have_no_selector('p.user_email', exact_text: instance_user.user.email)
        end

        expect(page).to have_selector('div.user_name', exact_text: instance_admin.name)
        expect(page).to have_selector('p.user_email', exact_text: instance_admin.email)
      end

      scenario "I can change a user's role", js: true do
        visit admin_instance_users_path

        user_to_change = instance_users.sample

        within find("tr.instance_user_#{user_to_change.id}") do
          find('div.user_role').click
        end
        find("#role-#{user_to_change.id}-administrator").select_option
        # byebug
        expect_toastify("Successfully changed #{user_to_change.user.name}'s role to Administrator.")

        expect(user_to_change.reload).to be_administrator
      end

      scenario 'I can delete a user' do
        visit admin_instance_users_path

        user_to_delete = instance_users.sample
        find("button.user-delete-#{user_to_delete.id}").click
        accept_confirm_dialog
        expect_toastify('User was deleted.')
      end

      scenario 'I can search users' do
        user_name = 'lool'
        instance_users_to_search = create_list(:user, 2, name: user_name).
                                   map { |u| u.instance_users.first }
        visit admin_instance_users_path

        # Search by username
        find('button[aria-label="Search"]').click
        find('div[aria-label="Search"]').find('input').set(user_name)

        sleep 0.5 # timeout for search debouncing

        instance_users_to_search.each do |instance_user|
          expect(page).to have_selector('div.user_name', text: instance_user.user.name)
        end
        expect(all('.instance_user').count).to eq(2)

        # Search by email
        random_instance_user = InstanceUser.order('RANDOM()').first
        find('div[aria-label="Search"]').find('input').set(random_instance_user.user.email)
        sleep 0.5 # timeout for search debouncing

        expect(page).to have_selector('div.user_name', text: random_instance_user.user.name)
        expect(all('.instance_user').count).to eq(1)
      end
    end
  end
end
