# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Administration: Discussion:: Topics' do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can change the discussion topics pagination' do
        visit course_admin_topics_path(course)

        invalid_pagination_count = -1
        valid_pagination_count = 20

        pagination_field = 'settings_topics_component_pagination'
        fill_in pagination_field, with: invalid_pagination_count
        click_button 'update'
        expect(page).to have_css('div.has-error')

        fill_in pagination_field, with: valid_pagination_count
        click_button 'update'
        expect(page).
          to have_selector('div',
                           text: I18n.t('course.admin.discussion.topic_settings.update.success'))
        expect(page).
          to have_field(pagination_field, with: valid_pagination_count)
      end

      scenario 'I can change the discussion topics component title' do
        visit course_admin_topics_path(course)

        new_title = 'Discussions'
        empty_title = ''

        title_field = 'settings_topics_component_title'
        fill_in title_field, with: new_title
        click_button 'update'
        expect(page).
          to have_selector('div',
                           text: I18n.t('course.admin.discussion.topic_settings.update.success'))
        expect(page).to have_field(title_field, with: new_title)
        expect(page).to have_selector('li a', text: new_title)

        fill_in title_field, with: empty_title
        click_button 'update'
        expect(page).
          to have_selector('li a', text: I18n.t('course.discussion.topics.sidebar_title'))
      end
    end
  end
end
