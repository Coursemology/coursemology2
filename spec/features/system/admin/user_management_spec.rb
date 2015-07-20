require 'rails_helper'

RSpec.feature 'System: Administration: Users' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    context 'As a System Administrator' do
      let(:admin) { create(:administrator) }
      before { login_as(admin, scope: :user) }

      let!(:users) do
        create_list(:user, 2)
        User.sorted_by_name.page(1)
      end
      scenario 'I can view all users in the system' do
        visit admin_users_path

        users.each do |user|
          expect(page).to have_selector('tr.user th', text: user.name)
          expect(page).to have_selector('tr.user td', text: user.email)
        end
      end
    end
  end
end
