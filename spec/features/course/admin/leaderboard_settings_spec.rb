# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Administration: Leaderboard' do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can change the leaderboard display user count setting' do
        visit course_admin_leaderboard_path(course)

        invalid_display_user_count = -1
        valid_display_user_count = 100

        user_count_field = 'settings_leaderboard_component_display_user_count'
        fill_in user_count_field, with: invalid_display_user_count
        click_button 'update'
        expect(page).to have_css('div.has-error')

        fill_in user_count_field, with: valid_display_user_count
        click_button 'update'
        expect(page).
          to have_selector('div', text: I18n.t('course.admin.leaderboard_settings.update.success'))
        expect(page).to have_field(user_count_field, with: valid_display_user_count)
      end

      scenario 'I can change the leaderboard title' do
        visit course_admin_leaderboard_path(course)

        new_title = 'New Title'
        empty_title = ''

        title_field = 'settings_leaderboard_component_title'
        fill_in title_field, with: new_title
        click_button 'update'
        expect(page).
          to have_selector('div', text: I18n.t('course.admin.leaderboard_settings.update.success'))
        expect(page).to have_field(title_field, with: new_title)
        expect(page).to have_selector('li a', text: new_title)

        fill_in title_field, with: empty_title
        click_button 'update'
        expect(page).
          to have_selector('div', text: I18n.t('course.admin.leaderboard_settings.update.success'))
        expect(page).to have_selector('li a', text: I18n.t('course.leaderboards.sidebar_title'))
      end

      scenario 'I can enable and disable the group leaderboard' do
        visit course_admin_leaderboard_path(course)

        enable_group_leaderboard_field = 'settings_leaderboard_component_enable_group_leaderboard'
        expect(page).not_to have_checked_field(enable_group_leaderboard_field)
        check(enable_group_leaderboard_field)
        click_button 'update'

        visit group_course_leaderboard_path(course)
        expect(page).
          to have_selector('li a', text: I18n.t('course.leaderboards.tabs.group_leaderboard'))

        visit course_admin_leaderboard_path(course)
        expect(page).to have_checked_field(enable_group_leaderboard_field)
        uncheck(enable_group_leaderboard_field)
        click_button 'update'

        visit course_leaderboard_path(course)
        expect(page).
          not_to have_selector('li a', text: I18n.t('course.leaderboards.tabs.group_leaderboard'))
      end

      scenario 'I can change the title of the group leaderboard' do
        visit course_admin_leaderboard_path(course)

        new_title = 'New Title'
        empty_title = ''

        group_leaderboard_title_field = 'settings_leaderboard_component_group_leaderboard_title'
        check('settings_leaderboard_component_enable_group_leaderboard')
        fill_in group_leaderboard_title_field, with: new_title
        click_button 'update'
        expect(page).
          to have_selector('div', text: I18n.t('course.admin.leaderboard_settings.update.success'))
        expect(page).to have_field(group_leaderboard_title_field, with: new_title)

        visit group_course_leaderboard_path(course)
        expect(page).to have_selector('h1', text: new_title)
        expect(page).to have_selector('li a', text: new_title)

        visit course_admin_leaderboard_path(course)
        fill_in group_leaderboard_title_field, with: empty_title
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
