# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Category: Management' do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }
      scenario 'I can create a new category' do
        category = attributes_for(:course_assessment_category)

        visit course_admin_assessments_path(course)
        find_link(nil, href: new_course_admin_assessments_category_path(course)).click

        expect(current_path).to eq(new_course_admin_assessments_category_path(course))
        fill_in 'title', with: category[:title]
        fill_in 'weight', with: category[:weight]
        click_button 'submit'

        expect(current_path).to eq(course_admin_assessments_path(course))
        expect(page).to have_selector('div.alert.alert-success')
      end

      scenario 'I can edit category fields' do
        category = course.assessment_categories.first
        category_edited = attributes_for(:course_assessment_category)

        visit course_admin_assessments_path(course)

        title_field = find(:css, "#{content_tag_selector(category)} input.category_title")
        weight_field = find(:css, "#{content_tag_selector(category)} input.category_weight")

        expect(title_field.value).to eq(category.title)
        expect(weight_field.value.to_i).to eq(category.weight)

        title_field.set(category_edited[:title])
        weight_field.set(category_edited[:weight])
        click_button 'submit'

        expect(title_field.value).to eq(category_edited[:title])
        expect(weight_field.value.to_i).to eq(category_edited[:weight])
        expect(page).
          to have_selector('div.alert.alert-success',
                           text: "x#{I18n.t('course.admin.assessment_settings.update.success')}")
      end

      scenario 'I can delete a category' do
        category = create(:course_assessment_category, course: course)
        visit course_admin_assessments_path(course)
        deletion_path = course_admin_assessments_category_path(course, category)
        find_link(nil, href: deletion_path).click
        expect(page).to have_selector('div.alert.alert-success')
      end

      scenario 'I cannot delete the last category' do
        visit course_admin_assessments_path(course)
        category = course.assessment_categories.first
        deletion_path =
          course_admin_assessments_category_path(course, category)
        find_link(nil, href: deletion_path).click
        expect(page).not_to have_selector('div.alert.alert-success')
        expect(page).to have_selector('div.alert.alert-danger')
        expect(page).to have_content_tag_for(category)
      end
    end
  end
end
