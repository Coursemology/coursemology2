require 'rails_helper'

RSpec.feature 'User: Profile' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:user) { create(:user) }
    before do
      login_as(user, scope: :user)
      visit edit_user_profile_path
    end

    scenario 'I can change my name' do
      new_name = 'New Name'
      empty_name = ''

      fill_in :user_name, with: empty_name
      click_button 'submit'
      expect(page).to have_selector('div.alert-danger')

      fill_in :user_name, with: new_name
      click_button 'submit'
      expect(page).to have_selector('div', text: I18n.t('user.profiles.update.success'))
      expect(page).to have_field('user_name', with: new_name)
    end
  end
end
