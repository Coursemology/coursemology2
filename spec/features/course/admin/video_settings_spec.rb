# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Administration: Videos', js: true do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can change the videos title' do
        visit course_admin_videos_path(course)

        new_title = 'New Title'
        empty_title = ''

        title_field = 'title'
        fill_in title_field, with: new_title
        click_button 'Save changes'
        expect_toastify('Your changes have been saved.')
        expect(page).to have_field(title_field, with: new_title)

        visit current_path
        expect(find_sidebar).to have_selector('#sidebar_item_videos', text: new_title)

        fill_in title_field, with: empty_title
        click_button 'Save changes'
        expect_toastify('Your changes have been saved.')

        visit current_path
        expect(find_sidebar).to have_selector('#sidebar_item_videos')
      end
    end
  end
end
