# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'System: Administration: Instance: Users', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:instance_admin) { create(:instance_user, role: :administrator).user }
    let!(:instance_users) { create_list(:instance_user, 2) }

    context 'As a Instance Administrator' do
      before { login_as(instance_admin, scope: :user) }

      scenario 'I can view all users in the instance' do
        visit admin_instance_users_path

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

      # Flaky test
      xscenario "I can change a user's role" do
        visit admin_instance_users_path

        user_to_change = instance_users.sample

        within find("tr.instance_user_#{user_to_change.id}") do
          find('div.user_role').click
        end
        find("#role-#{user_to_change.id}-administrator").select_option
        expect_toastify("Successfully changed #{user_to_change.user.name}'s role to Administrator.")

        expect(user_to_change.reload).to be_administrator
      end

      scenario 'I can delete a user' do
        visit admin_instance_users_path

        user_to_delete = instance_users.sample
        find("button.user-delete-#{user_to_delete.id}").click
        accept_prompt
        expect_toastify('User was deleted.')
      end

      scenario 'I can search users' do
        skip 'Flaky tests'
        user_name = 'lool'
        instance_users_to_search = create_list(:user, 2, name: user_name).
                                   map { |u| u.instance_users.first }
        visit admin_instance_users_path

        # Search by username
        click_button 'Search'
        find('div[aria-label="Search"]').find('input').set(user_name)

        wait_for_field_debouncing # timeout for search debouncing

        instance_users_to_search.each do |instance_user|
          expect(page).to have_text(instance_user.user.name)
        end
        expect(all('.instance_user').count).to eq(2)

        # Search by email
        random_instance_user = InstanceUser.order('RANDOM()').first
        find('div[aria-label="Search"]').find('input').set(random_instance_user.user.email)
        wait_for_field_debouncing # timeout for search debouncing

        expect(page).to have_text(random_instance_user.user.name)
        expect(all('.instance_user').count).to eq(1)
      end
    end
  end
end
