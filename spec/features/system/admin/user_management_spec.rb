# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'System: Administration: Users' do
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
          expect(page).to have_selector("tr.user input[value='#{user.name}']")
          expect(page).to have_selector('tr.user td', text: user.email)
        end
      end

      scenario 'I can filter users by role and view only administrators' do
        visit admin_users_path(role: :administrator)

        User.human_users.normal.ordered_by_name.limit(3).each do |user|
          expect(page).to have_no_selector("tr.user input[value='#{user.name}']")
          expect(page).to have_no_selector('tr.user td', text: user.email)
        end

        User.human_users.administrator.ordered_by_name.limit(3).each do |user|
          expect(page).to have_selector("tr.user input[value='#{user.name}']")
          expect(page).to have_selector('tr.user td', text: user.email)
        end
      end

      scenario "I can change a user's record", js: true do
        visit admin_users_path

        user_to_change = users.sample
        within find(content_tag_selector(user_to_change)) do
          within find_field('user_role', visible: false) do
            select ''
          end
          click_button 'update'
        end

        wait_for_ajax
        expect(page).to have_selector('div.alert.alert-danger')

        new_name = 'updated user name'
        within find(content_tag_selector(user_to_change)) do
          fill_in 'user_name', with: new_name
          select 'administrator'
          click_button 'update'
        end

        wait_for_ajax
        expect(page).to have_selector('div', text: I18n.t('system.admin.users.update.success'))
        expect(user_to_change.reload).to be_administrator
        expect(user_to_change.name).to eq(new_name)
      end

      let!(:user_to_delete) { create(:user, name: '!' + users.first.name) }
      scenario 'I can delete a user' do
        visit admin_users_path

        find_link(nil, href: admin_user_path(user_to_delete)).click
        expect(page).to have_selector('div', text: I18n.t('system.admin.users.destroy.success'))
      end

      scenario 'I can search users' do
        user_name = SecureRandom.hex
        users_to_search = create_list(:user, 2, name: user_name)
        visit admin_users_path

        # Search by username
        fill_in 'search', with: user_name
        click_button I18n.t('layouts.search_form.search_button')

        users_to_search.each { |user| expect(page).to have_content_tag_for(user) }
        expect(all('.user').count).to eq(2)

        # Search by email
        random_user = users_to_search.sample
        fill_in 'search', with: random_user.email
        click_button I18n.t('layouts.search_form.search_button')

        expect(page).to have_content_tag_for(random_user)
        expect(all('.user').count).to eq(1)
      end
    end
  end
end
