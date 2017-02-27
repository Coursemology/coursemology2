# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Administration: Lecture' do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can change the lecture pagination settings' do
        visit course_admin_lectures_path(course)

        invalid_pagination_count = -1
        valid_pagination_count = 100

        fill_in 'lecture_settings_pagination', with: invalid_pagination_count
        click_button 'update'
        expect(page).to have_css('div.has-error')

        fill_in 'lecture_settings_pagination', with: valid_pagination_count
        click_button 'update'
        expect(page).
          to have_selector('div', text: I18n.t('course.admin.lecture_settings.update.success'))
        expect(page).to have_field('lecture_settings_pagination', with: valid_pagination_count)
      end

      scenario 'I can change the lectures title' do
        visit course_admin_lectures_path(course)

        new_title = 'New Title'
        empty_title = ''

        fill_in 'lecture_settings_title', with: new_title
        click_button 'update'
        expect(page).
          to have_selector('div', text: I18n.t('course.admin.lecture_settings.update.success'))
        expect(page).to have_field('lecture_settings_title', with: new_title)
        expect(page).to have_selector('li a', text: new_title)

        fill_in 'lecture_settings_title', with: empty_title
        click_button 'update'
        expect(page).
          to have_selector('div', text: I18n.t('course.admin.lecture_settings.update.success'))
        expect(page).to have_selector('li a', text: I18n.t('course.lectures.sidebar_title'))
      end
    end
  end
end