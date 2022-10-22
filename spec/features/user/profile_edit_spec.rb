# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'User: Profile', js: true do
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
        time_zone = 'Singapore'

        fill_in 'name', with: new_name
        select time_zone, from: 'timezone'
        click_button 'Save changes'

        expect_toastify('Your changes have been saved.')
        expect(page).to have_field('name', with: new_name)
        expect(user.reload.time_zone).to eq(time_zone)
      end

      scenario 'I can change my profile photo' do
        photo = File.join(Rails.root, '/spec/fixtures/files/picture.jpg')

        attach_file(photo) do
          find('label', text: 'Change', visible: false).click
        end

        click_button 'Done'
        click_button 'Save changes'
        sleep 0.5

        expect_toastify('Your changes have been saved.')
        expect(user.reload.profile_photo.url).to be_present
      end

      # NOTE: Facebook login feature is currently disabled.
      xscenario 'I can link my account to facebook' do
        facebook_link = find_link(nil, href: user_facebook_omniauth_authorize_path)
        expect { facebook_link.click }.to change { user.identities.count }.by(1)
        expect(page).to have_selector('div',
                                      text: I18n.t('user.omniauth_callbacks.facebook.success'))
      end
    end
  end
end
