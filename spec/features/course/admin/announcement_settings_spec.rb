require 'rails_helper'

RSpec.feature 'Course: Administration: Announcement' do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, :approved, course: course).user }

      scenario 'I can change the announcement pagination settings' do
        visit course_admin_announcements_path(course)

        invalid_pagination_count = -1
        valid_pagination_count = 100

        fill_in 'announcement_settings_pagination', with: invalid_pagination_count
        click_button 'update'
        expect(page).to have_css('div.has-error')

        fill_in 'announcement_settings_pagination', with: valid_pagination_count
        click_button 'update'
        expect(page).
          to have_selector('div', text: I18n.t('course.admin.announcement_settings.update.success'))
        expect(page).to have_field('announcement_settings_pagination', with: valid_pagination_count)
      end

      scenario 'I can change the announcements title' do
        visit course_admin_announcements_path(course)

        new_title = 'New Title'
        empty_title = ''

        fill_in 'announcement_settings_title', with: new_title
        click_button 'update'
        expect(page).
          to have_selector('div', text: I18n.t('course.admin.announcement_settings.update.success'))
        expect(page).to have_field('announcement_settings_title', with: new_title)
        expect(page).to have_selector('li a', text: new_title)

        fill_in 'announcement_settings_title', with: empty_title
        click_button 'update'
        expect(page).
          to have_selector('div', text: I18n.t('course.admin.announcement_settings.update.success'))
        expect(page).to have_selector('li a', text: I18n.t('course.announcements.sidebar_title'))
      end
    end
  end
end
