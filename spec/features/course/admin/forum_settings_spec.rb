# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Administration: Forums' do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can change the forums title' do
        visit course_admin_forums_path(course)

        new_title = 'New Title'
        empty_title = ''

        title_field = 'settings_forums_component_title'
        fill_in title_field, with: new_title
        click_button 'update'
        expect(page).
          to have_selector('div', text: I18n.t('course.admin.forum_settings.update.success'))
        expect(page).to have_field(title_field, with: new_title)
        expect(page).to have_selector('li a', text: new_title)

        fill_in title_field, with: empty_title
        click_button 'update'
        expect(page).
          to have_selector('div', text: I18n.t('course.admin.forum_settings.update.success'))
        expect(page).to have_selector('li a', text: I18n.t('course.forum.forums.sidebar_title'))
      end

      scenario 'I can change the forum pagination settings' do
        visit course_admin_forums_path(course)

        invalid_pagination_count = -1
        valid_pagination_count = 100

        pagination_field = 'settings_forums_component_pagination'
        fill_in pagination_field, with: invalid_pagination_count
        click_button 'update'
        expect(page).to have_css('div.has-error')

        fill_in pagination_field, with: valid_pagination_count
        click_button 'update'
        expect(page).
          to have_selector('div', text: I18n.t('course.admin.forum_settings.update.success'))
        expect(page).to have_field(pagination_field, with: valid_pagination_count)
      end
    end
  end
end
