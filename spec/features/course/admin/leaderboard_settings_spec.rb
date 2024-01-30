# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Administration: Leaderboard', js: true do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:group_category1) { create(:course_group_category, course: course) }
    let!(:group_category2) { create(:course_group_category, course: course) }
    let!(:groups) { create_list(:course_group, 3, group_category: group_category1) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can change the leaderboard display user count setting' do
        visit course_admin_leaderboard_path(course)

        invalid_display_user_count = -1
        valid_display_user_count = 100

        user_count_field = 'displayUserCount'
        fill_in user_count_field, with: invalid_display_user_count
        click_button 'Save changes'
        expect(page).to have_text('must be greater than or equal to 0')

        fill_in user_count_field, with: valid_display_user_count
        click_button 'Save changes'
        expect_toastify('Your changes have been saved.')
        expect(page).to have_field(user_count_field, with: valid_display_user_count)
      end

      scenario 'I can change the leaderboard title' do
        visit course_admin_leaderboard_path(course)

        new_title = 'New Title'
        empty_title = ''

        title_field = 'title'
        fill_in title_field, with: new_title
        click_button 'Save changes'
        expect_toastify('Your changes have been saved.')
        expect(page).to have_field(title_field, with: new_title)

        visit current_path
        expect(find_sidebar).to have_text(new_title)

        fill_in title_field, with: empty_title
        click_button 'Save changes'
        expect_toastify('Your changes have been saved.')

        visit current_path
        expect(find_sidebar).to have_text(I18n.t('course.leaderboards.sidebar_title'))
      end

      scenario 'I can enable and disable the group leaderboard' do
        visit course_admin_leaderboard_path(course)

        option = find('label', text: 'Enable Group Leaderboard')

        option.click
        click_button 'Save changes'
        expect_toastify('Your changes have been saved.')

        visit course_leaderboard_path(course)
        expect(page).to have_button('Group Leaderboard')

        visit course_admin_leaderboard_path(course)
        option.click
        click_button 'Save changes'
        expect_toastify('Your changes have been saved.')

        visit course_leaderboard_path(course)
        expect(page).not_to have_button('Group Leaderboard')
      end

      scenario 'I can change the title of the group leaderboard' do
        visit course_admin_leaderboard_path(course)

        new_title = 'New Title'
        empty_title = ''

        find('label', text: 'Enable Group Leaderboard').click

        group_leaderboard_title_field = 'title'
        fill_in group_leaderboard_title_field, with: new_title

        click_button 'Save changes'
        expect_toastify('Your changes have been saved.')
        expect(page).to have_field(group_leaderboard_title_field, with: new_title)

        visit course_leaderboard_path(course)
        expect(page).to have_button(new_title)

        visit course_admin_leaderboard_path(course)
        fill_in group_leaderboard_title_field, with: empty_title
        click_button 'Save changes'
        expect_toastify('Your changes have been saved.')

        visit course_leaderboard_path(course)
        expect(page).to have_button('Group Leaderboard')
      end
    end
  end
end
