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
        expect(page).to have_selector('li a', text: I18n.t('course.leaderboards.sidebar_title'))
      end

      scenario 'I can enable and disable the group leaderboard' do
        visit course_admin_leaderboard_path(course)

        expect(page).not_to have_checked_field('leaderboard_settings_enable_group_leaderboard')
        check('leaderboard_settings_enable_group_leaderboard')
        click_button 'update'

        visit group_course_leaderboard_path(course)
        expect(page).
          to have_selector('li a', text: I18n.t('course.leaderboards.tabs.group_leaderboard'))

        visit course_admin_leaderboard_path(course)
        expect(page).to have_checked_field('leaderboard_settings_enable_group_leaderboard')
        uncheck('leaderboard_settings_enable_group_leaderboard')
        click_button 'update'

        visit course_leaderboard_path(course)
        expect(page).
          not_to have_selector('li a', text: I18n.t('course.leaderboards.tabs.group_leaderboard'))
      end

      scenario 'I can change the title of the group leaderboard' do
        visit course_admin_leaderboard_path(course)

        new_title = 'New Title'
        empty_title = ''

        check('leaderboard_settings_enable_group_leaderboard')
        fill_in 'leaderboard_settings_group_leaderboard_title', with: new_title
        click_button 'update'
        expect(page).
          to have_selector('div', text: I18n.t('course.admin.leaderboard_settings.update.success'))
        expect(page).to have_field('leaderboard_settings_group_leaderboard_title', with: new_title)

        visit group_course_leaderboard_path(course)
        expect(page).to have_selector('h1', text: new_title)
        expect(page).to have_selector('li a', text: new_title)

        visit course_admin_leaderboard_path(course)
        fill_in 'leaderboard_settings_group_leaderboard_title', with: empty_title
        click_button 'update'
        expect(page).
          to have_selector('div', text: I18n.t('course.admin.leaderboard_settings.update.success'))

        visit group_course_leaderboard_path(course)
        expect(page).
          to have_selector('h1', text: I18n.t('course.leaderboards.groups.header'))
        expect(page).
          to have_selector('li a', text: I18n.t('course.leaderboards.tabs.group_leaderboard'))
      end
    end
  end
end
