# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Administration: Forums', js: true do
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

        title_field = 'title'
        fill_in title_field, with: new_title
        click_button 'Save changes'
        expect_toastify('Your changes have been saved.')
        expect(page).to have_field(title_field, with: new_title)
        expect(course.reload.settings(:course_forums_component).title).to eq(new_title)

        visit current_path
        expect(find_sidebar).to have_text(new_title)

        fill_in title_field, with: empty_title
        click_button 'Save changes'
        expect_toastify('Your changes have been saved.')
        expect(course.reload.settings(:course_forums_component).title).to eq(nil)

        visit current_path
        expect(find_sidebar).to have_text(I18n.t('course.forum.forums.sidebar_title'))
      end

      scenario 'I can change the forum pagination settings' do
        visit course_admin_forums_path(course)

        invalid_pagination_count = -1
        valid_pagination_count = 100

        pagination_field = 'pagination'
        fill_in pagination_field, with: invalid_pagination_count
        click_button 'Save changes'
        expect_toastify('Your changes have been saved.')
        expect(page).
          to have_field(pagination_field, with: invalid_pagination_count.abs)
        expect(course.reload.settings(:course_forums_component).pagination).to eq(invalid_pagination_count.abs)

        fill_in pagination_field, with: valid_pagination_count
        click_button 'Save changes'
        expect_toastify('Your changes have been saved.')
        expect(page).to have_field(pagination_field, with: valid_pagination_count)
        expect(course.reload.settings(:course_forums_component).pagination).to eq(valid_pagination_count)
      end

      scenario 'I can change the forum anonymous settings' do
        visit course_admin_forums_path(course)

        find_field('allowAnonymousPost', visible: false).set(true)

        click_button 'Save changes'
        expect_toastify('Your changes have been saved.')
        expect(page).to have_field('allowAnonymousPost', checked: true, visible: false)
        expect(course.reload.settings(:course_forums_component).allow_anonymous_post).to be_truthy

        find_field('allowAnonymousPost', visible: false).set(false)
        click_button 'Save changes'
        expect_toastify('Your changes have been saved.')
        expect(page).to have_field('allowAnonymousPost', checked: false, visible: false)
        expect(course.reload.settings(:course_forums_component).allow_anonymous_post).to be_falsy
      end
    end
  end
end
