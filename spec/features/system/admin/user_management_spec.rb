require 'rails_helper'

RSpec.feature 'System: Administration: Users' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    context 'As a System Administrator' do
      let(:admin) { create(:administrator) }
      before { login_as(admin, scope: :user) }

      let!(:users) do
        create_list(:user, 2)
        User.human_users.ordered_by_name.page(1)
      end
      scenario 'I can view all users in the system' do
        visit admin_users_path

        users.each do |user|
          expect(page).to have_selector('tr.user th', text: user.name)
          expect(page).to have_selector('tr.user td', text: user.email)
        end
      end

      scenario 'I can change a user\'s role' do
        user_to_change = users.sample
        visit admin_users_path

        field = find('tr.user td', text: user_to_change.email)

        within field.find(:xpath, '..') do
          select '', from: 'user_role'
          find_button('update').click
        end
        expect(page).to have_selector('div.alert.alert-danger')

        within field.find(:xpath, '..') do
          select 'administrator', from: 'user_role'
          find_button('update').click
        end
        expect(page).to have_selector('div', text: I18n.t('system.admin.users.update.success'))
        expect(user_to_change.reload).to be_administrator
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
        click_button 'layouts.search_form.search_button'

        users_to_search.each { |user| expect(page).to have_content_tag_for(user) }
        expect(all('.user').count).to eq(2)

        # Search by email
        random_user = User.order('RANDOM()').first
        fill_in 'search', with: random_user.email
        click_button 'layouts.search_form.search_button'

        expect(page).to have_content_tag_for(random_user)
        expect(all('.user').count).to eq(1)
      end
    end
  end
end
