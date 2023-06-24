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
        wait_for_page

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
        wait_for_page

        expect(user.reload.profile_photo.url).to be_present
      end
    end
  end
end
