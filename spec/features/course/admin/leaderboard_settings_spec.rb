# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Administration: Leaderboard' do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, :approved, course: course).user }

      scenario 'I can change the leaderboard display user count setting' do
        visit course_admin_leaderboard_path(course)

        invalid_display_user_count = -1
        valid_display_user_count = 100

        fill_in 'leaderboard_settings_display_user_count', with: invalid_display_user_count
        click_button 'update'
        expect(page).to have_css('div.has-error')

        fill_in 'leaderboard_settings_display_user_count', with: valid_display_user_count
        click_button 'update'
        expect(page).
          to have_selector('div', text: I18n.t('course.admin.leaderboard_settings.update.success'))
        expect(page).to have_field('leaderboard_settings_display_user_count',
                                   with: valid_display_user_count)
      end

      scenario 'I can change the leaderboard title' do
        visit course_admin_leaderboard_path(course)

        new_title = 'New Title'
        empty_title = ''

        fill_in 'leaderboard_settings_title', with: new_title
        click_button 'update'
        expect(page).
          to have_selector('div', text: I18n.t('course.admin.leaderboard_settings.update.success'))
        expect(page).to have_field('leaderboard_settings_title', with: new_title)
        expect(page).to have_selector('li a', text: new_title)

        fill_in 'leaderboard_settings_title', with: empty_title
        click_button 'update'
        expect(page).
          to have_selector('div', text: I18n.t('course.admin.leaderboard_settings.update.success'))
        expect(page).to have_selector('li a', text: I18n.t('course.leaderboard.sidebar_title'))
      end
    end
  end
end
