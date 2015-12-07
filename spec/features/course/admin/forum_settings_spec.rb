require 'rails_helper'

RSpec.feature 'Course: Administration: Forums' do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }

    context 'As a Course Administrator' do
      before { login_as(user, scope: :user) }

      scenario 'I can change the forums title' do
        visit course_admin_forums_path(course)

        new_title = 'New Title'
        empty_title = ''

        fill_in 'forum_settings_title', with: new_title
        click_button 'update'
        expect(page).
          to have_selector('div', text: I18n.t('course.admin.forum_settings.update.success'))
        expect(page).to have_field('forum_settings_title', with: new_title)
        expect(page).to have_selector('li a', text: new_title)

        fill_in 'forum_settings_title', with: empty_title
        click_button 'update'
        expect(page).
          to have_selector('div', text: I18n.t('course.admin.forum_settings.update.success'))
        expect(page).to have_selector('li a', text: I18n.t('course.forum.forums.sidebar_title'))
      end

      scenario 'I can change the topics title' do
        visit course_admin_forums_path(course)

        new_title = 'New Title'
        empty_title = ''

        fill_in 'forum_settings_topic_title', with: new_title
        click_button 'update'
        expect(page).
          to have_selector('div', text: I18n.t('course.admin.forum_settings.update.success'))
        expect(page).to have_field('forum_settings_topic_title', with: new_title)

        fill_in 'forum_settings_topic_title', with: empty_title
        click_button 'update'
        expect(page).
          to have_selector('div', text: I18n.t('course.admin.forum_settings.update.success'))
      end

      scenario 'I can change the forum pagination settings' do
        visit course_admin_forums_path(course)

        invalid_pagination_count = -1
        valid_pagination_count = 100

        fill_in 'forum_settings_forum_pagination', with: invalid_pagination_count
        click_button 'update'
        expect(page).to have_css('div.has-error')

        fill_in 'forum_settings_forum_pagination', with: valid_pagination_count
        click_button 'update'
        expect(page).
          to have_selector('div', text: I18n.t('course.admin.forum_settings.update.success'))
        expect(page).to have_field('forum_settings_forum_pagination', with: valid_pagination_count)
      end

      scenario 'I can change the topic pagination settings' do
        visit course_admin_forums_path(course)

        invalid_pagination_count = -1
        valid_pagination_count = 100

        fill_in 'forum_settings_topic_pagination', with: invalid_pagination_count
        click_button 'update'
        expect(page).to have_css('div.has-error')

        fill_in 'forum_settings_topic_pagination', with: valid_pagination_count
        click_button 'update'
        expect(page).
          to have_selector('div', text: I18n.t('course.admin.forum_settings.update.success'))
        expect(page).to have_field('forum_settings_topic_pagination', with: valid_pagination_count)
      end
    end
  end
end
