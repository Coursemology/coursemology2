# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Assessments: Management', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }
      let(:category) { course.assessment_categories.first }
      let(:tab) { category.tabs.first }

      scenario 'I can create a new tab' do
        visit course_admin_assessments_path(course)
        category_element = find_rbd_category(category.id)

        within category_element do
          click_button 'Tab'
        end

        expect_toastify('New Tab was successfully created.')
        expect(page).to have_content('New Tab')
      end

      scenario 'I can rename a tab' do
        tab_edited = attributes_for(:course_assessment_tab)

        visit course_admin_assessments_path(course)
        tab_element = find_rbd_tab(tab.id)
        rename_button = tab_element.all('button', visible: false).first
        previous_title = tab.title

        hover_then_click rename_button
        title_field = tab_element.find('input')
        title_field.set(tab_edited[:title])
        title_field.native.send_keys(:return)
        click_button 'Save changes'

        expect_toastify('Your changes have been saved.')
        expect(page).to have_content(tab_edited[:title])
        expect(page).not_to have_content(previous_title)
      end

      scenario 'I can reorder a tab' do
        first_tab = tab
        tab_to_move = create(:course_assessment_tab, course: course, category: category)
        previous_tabs = category.tabs
        expect(previous_tabs[0]).to eq(first_tab)
        expect(previous_tabs[1]).to eq(tab_to_move)

        visit course_admin_assessments_path(course)
        tab_to_move_element = find_rbd_tab(tab_to_move.id)
        category_element = find_rbd_category(category.id)

        drag_rbd(tab_to_move_element, category_element)
        click_button 'Save changes'

        expect_toastify('Your changes have been saved.')
        updated_tabs = category.reload.tabs
        expect(updated_tabs[0]).to eq(tab_to_move)
        expect(updated_tabs[1]).to eq(first_tab)
      end

      scenario 'I can delete a tab' do
        tab_to_delete = create(:course_assessment_tab, course: course, category: category)

        visit course_admin_assessments_path(course)
        tab_to_delete_element = find_rbd_tab(tab_to_delete.id)
        delete_button = tab_to_delete_element.all('button', visible: false).last

        hover_then_click delete_button

        expect_toastify("#{tab_to_delete.title} was successfully deleted.")
        expect(page).not_to have_content(tab_to_delete.title)
        expect(page).to have_content(tab.title)
      end

      scenario 'I cannot delete the last tab of the last category' do
        visit course_admin_assessments_path(course)

        tab_element = find_rbd_tab(tab.id)
        buttons = tab_element.all('button', visible: false)

        expect(buttons.length).to be(1)
        expect(tab_element).not_to have_selector('[data-testid="DeleteIcon"]')
        expect(page).to have_content(tab.title)
      end
    end
  end
end
