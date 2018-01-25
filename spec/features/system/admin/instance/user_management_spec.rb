# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'System: Administration: Instance: Users' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:instance_admin) { create(:instance_user, role: :administrator).user }
    let!(:instance_users) { create_list(:instance_user, 2) }

    context 'As a Instance Administrator' do
      before { login_as(instance_admin, scope: :user) }

      scenario 'I can view all users in the instance' do
        visit admin_instance_users_path

        instance_users.each do |instance_users|
          expect(page).to have_selector('tr.instance_user th', text: instance_users.user.name)
          expect(page).to have_selector('tr.instance_user td', text: instance_users.user.email)
        end

        expect(page.all('tr.instance_user').count).to eq(instance.instance_users.count)
      end

      scenario 'I can filter users by role and view only administrators' do
        visit admin_instance_users_path(role: :administrator)

        instance_users.each do |instance_users|
          expect(page).not_to have_selector('tr.instance_user th', text: instance_users.user.name)
          expect(page).not_to have_selector('tr.instance_user td', text: instance_users.user.email)
        end

        expect(page).to have_selector('tr.instance_user th', text: instance_admin.name)
        expect(page).to have_selector('tr.instance_user td', text: instance_admin.email)
      end

      scenario "I can change a user's role", js: true do
        visit admin_instance_users_path

        user_to_change = instance_users.sample
        within find(content_tag_selector(user_to_change)) do
          within find_field('instance_user_role', visible: false) do
            select ''
          end
          click_button 'update'
        end

        wait_for_ajax
        expect(page).to have_selector('div.alert.alert-danger')

        within find(content_tag_selector(user_to_change)) do
          find('.dropdown-toggle').click
          find('ul.dropdown-menu.inner').find('span', text: 'administrator').click
          click_button 'update'
        end

        wait_for_ajax
        expect(page).to have_selector('div',
                                      text: I18n.t('system.admin.instance.users.update.success'))
        expect(user_to_change.reload).to be_administrator
      end

      scenario 'I can delete a user' do
        visit admin_instance_users_path

        user_to_delete = instance_users.sample
        find_link(nil, href: admin_instance_user_path(user_to_delete)).click
        expect(page).to have_selector('div',
                                      text: I18n.t('system.admin.instance.users.destroy.success'))
      end

      scenario 'I can search users' do
        user_name = 'lool'
        instance_users_to_search = create_list(:user, 2, name: user_name).
                                   map { |u| u.instance_users.first }
        visit admin_instance_users_path

        # Search by username
        fill_in 'search', with: user_name
        click_button I18n.t('layouts.search_form.search_button')

        instance_users_to_search.each { |user| expect(page).to have_content_tag_for(user) }
        expect(all('.instance_user').count).to eq(2)

        # Search by email
        random_instance_user = InstanceUser.order('RANDOM()').first
        fill_in 'search', with: random_instance_user.user.email
        click_button I18n.t('layouts.search_form.search_button')

        expect(page).to have_content_tag_for(random_instance_user)
        expect(all('.instance_user').count).to eq(1)
      end
    end
  end
end
