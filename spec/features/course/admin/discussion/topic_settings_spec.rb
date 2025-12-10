# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Administration: Discussion:: Topics', js: true do
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

        pagination_field = 'pagination'
        fill_in pagination_field, with: invalid_pagination_count
        click_button 'Save changes'
        expect(page).to have_text('must be greater than zero')

        fill_in pagination_field, with: valid_pagination_count
        click_button 'Save changes'
        expect_toastify('Your changes have been saved.')
        expect(page).
          to have_field(pagination_field, with: valid_pagination_count)
      end

      scenario 'I can change the discussion topics component title' do
        visit course_admin_topics_path(course)

        new_title = 'Discussions'
        empty_title = ''

        title_field = 'title'
        fill_in title_field, with: new_title
        click_button 'Save changes'
        expect_toastify('Your changes have been saved.')
        expect(page).to have_field(title_field, with: new_title)

        visit current_path
        expect(find_sidebar).to have_selector('#sidebar_item_discussion_topics', text: new_title)

        fill_in title_field, with: empty_title
        click_button 'Save changes'
        expect_toastify('Your changes have been saved.')
        visit current_path
        expect(find_sidebar).to have_selector('#sidebar_item_discussion_topics')
      end
    end
  end
end
