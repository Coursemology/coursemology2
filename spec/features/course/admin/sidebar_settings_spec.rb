# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Administration: Sidebar', js: true do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can reorder a sidebar item' do
        visit course_admin_sidebar_path(course)

        sidebar_items = find_all('tr')
        first_item = sidebar_items[0]
        fifth_item = sidebar_items[4]
        first_item_title = first_item.text
        second_item_title = sidebar_items[1].text
        fifth_item_title = fifth_item.text

        drag_rbd(first_item, fifth_item)

        expect_toastify('The new sidebar ordering has been applied. Refresh to see the latest changes.')
        visit current_path
        reordered_sidebar_items = find_all('tr')
        expect(reordered_sidebar_items[0].text).to eq(second_item_title)
        expect(reordered_sidebar_items[3].text).to eq(fifth_item_title)
        expect(reordered_sidebar_items[4].text).to eq(first_item_title)
      end
    end
  end
end
