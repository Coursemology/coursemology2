# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Category: Management', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can create a new category' do
        visit course_admin_assessments_path(course)

        click_button 'Add a category'

        expect_toastify('New Category was successfully created.')
        expect(page).to have_content('New Category')
      end

      scenario 'I can rename a category' do
        category = course.assessment_categories.first
        category_edited = attributes_for(:course_assessment_category)

        visit course_admin_assessments_path(course)
        category_element = find_rbd_category(category.id)
        rename_button = category_element.all('button', visible: false).first
        previous_title = category.title

        hover_then_click rename_button
        title_field = category_element.find('input')
        title_field.set(category_edited[:title])
        title_field.native.send_keys(:return)
        click_button 'Save changes'

        expect_toastify('Your changes have been saved.')
        visit current_path
        expect(page).to have_content(category_element[:title])
        expect(page).not_to have_content(previous_title)
      end

      scenario 'I can reorder a category' do
        first_category = course.assessment_categories.first
        category_to_move = create(:course_assessment_category, course: course)
        previous_categories = course.assessment_categories
        expect(previous_categories[0]).to eq(first_category)
        expect(previous_categories[1]).to eq(category_to_move)

        visit course_admin_assessments_path(course)
        category_to_move_element = find_rbd_category(category_to_move.id)
        category_element = find_rbd_category(first_category.id)

        drag_rbd(category_to_move_element, category_element)
        click_button 'Save changes'

        expect_toastify('Your changes have been saved.')
        updated_categories = course.reload.assessment_categories
        expect(updated_categories[0]).to eq(category_to_move)
        expect(updated_categories[1]).to eq(first_category)
      end

      scenario 'I can delete a category' do
        category = create(:course_assessment_category, course: course)
        visit course_admin_assessments_path(course)
        category_element = find_rbd_category(category.id)
        delete_button = category_element.all('button', visible: false)[1]

        hover_then_click delete_button

        expect_toastify("#{category.title} was successfully deleted.")

        visit current_path
        expect(page).not_to have_content(category.title)
      end

      scenario 'I cannot delete the last category' do
        visit course_admin_assessments_path(course)
        category = course.assessment_categories.first
        category_element = find_rbd_category(category.id)
        buttons = category_element.all('button', visible: false)

        expect(buttons.length).to be(2)
        expect(category_element).not_to have_selector('[data-testid="DeleteIcon"]')
        expect(page).to have_content(category.title)
      end

      scenario 'I can move a tab to another category' do
        skip 'Flaky tests'
        default_category = course.assessment_categories.first
        tab = create(:course_assessment_tab, course: course)
        assessment = create(:assessment, course: course, tab: tab)
        expect(assessment.folder.parent).not_to eq(default_category.folder)

        visit course_admin_assessments_path(course)
        tab_element = find_rbd_tab(tab.id)
        default_category_element = find_rbd_tab(default_category.tabs.first.id)

        page.scroll_to default_category_element
        drag_rbd(tab_element, default_category_element)

        click_button 'Save changes'

        expect_toastify('Your changes have been saved.')
        expect(tab.reload.category).to eq(default_category)
        expect(assessment.reload.folder.parent).to eq(default_category.folder)
      end
    end
  end
end
