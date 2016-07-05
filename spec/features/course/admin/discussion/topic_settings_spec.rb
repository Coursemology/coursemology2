# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Administration: Discussion:: Topics' do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, :approved, course: course).user }

      scenario 'I can change the discussion topics pagination' do
        visit course_admin_topics_path(course)

        invalid_pagination_count = -1
        valid_pagination_count = 20

        fill_in 'discussion_topic_settings_pagination', with: invalid_pagination_count
        click_button 'update'
        expect(page).to have_css('div.has-error')

        fill_in 'discussion_topic_settings_pagination', with: valid_pagination_count
        click_button 'update'
        expect(page).
          to have_selector('div',
                           text: I18n.t('course.admin.discussion.topic_settings.update.success'))
        expect(page).
          to have_field('discussion_topic_settings_pagination', with: valid_pagination_count)
      end

      scenario 'I can change the discussion topics component title' do
        visit course_admin_topics_path(course)

        new_title = 'Discussions'
        empty_title = ''

        fill_in 'discussion_topic_settings_title', with: new_title
        click_button 'update'
        expect(page).
          to have_selector('div',
                           text: I18n.t('course.admin.discussion.topic_settings.update.success'))
        expect(page).to have_field('discussion_topic_settings_title', with: new_title)
        expect(page).to have_selector('li a', text: new_title)

        fill_in 'discussion_topic_settings_title', with: empty_title
        click_button 'update'
        expect(page).
          to have_selector('li a', text: I18n.t('course.discussion.topics.sidebar_title'))
      end
    end
  end
end
