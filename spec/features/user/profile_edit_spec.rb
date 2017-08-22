# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'User: Profile' do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:user) { create(:user) }
    before do
      login_as(user, scope: :user)
      visit edit_user_profile_path
    end

    context 'As a registered user' do
      scenario 'I can change my profile' do
        new_name = 'New Name'
        empty_name = ''
        time_zone = 'Singapore'

        fill_in :user_name, with: empty_name
        click_button 'submit'
        expect(page).to have_selector('div.alert-danger')

        fill_in :user_name, with: new_name
        find('#user_time_zone').find(:xpath, "option[@value='#{time_zone}']").select_option
        attach_file :user_profile_photo, File.join(Rails.root, '/spec/fixtures/files/picture.jpg')
        click_button 'submit'

        expect(page).to have_selector('div', text: I18n.t('user.profiles.update.success'))
        expect(page).to have_field('user_name', with: new_name)
        expect(user.reload.profile_photo.url).to be_present
        expect(user.reload.time_zone).to eq(time_zone)
      end

      scenario 'I can link my account to facebook' do
        facebook_link = find_link(nil, href: user_omniauth_authorize_path(:facebook))
        expect { facebook_link.click }.to change { user.identities.count }.by(1)
        expect(page).to have_selector('div',
                                      text: I18n.t('user.omniauth_callbacks.facebook.success'))
      end
    end
  end
end
