require 'rails_helper'

RSpec.feature 'Course: Administration: Announcement' do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:user) { create(:administrator) }
    let(:course) { create(:course, creator: user) }

    context 'As a Course Administrator' do
      before { login_as(user, scope: :user) }

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
    end
  end
end
