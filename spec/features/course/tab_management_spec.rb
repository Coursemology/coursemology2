# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Assessments: Management' do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }
      let(:category) { course.assessment_categories.first }
      let(:tab) { category.tabs.first }

      scenario 'I can create a new tab' do
        new_tab = attributes_for(:course_assessment_tab)

        visit course_admin_assessments_path(course)
        find_link(nil, href: new_course_admin_assessments_category_tab_path(course, category)).click

        expect(current_path).to eq(new_course_admin_assessments_category_tab_path(course, category))
        fill_in 'title', with: new_tab[:title]
        fill_in 'weight', with: new_tab[:weight]
        click_button 'submit'

        expect(current_path).to eq(course_admin_assessments_path(course))
        expect(page).to have_selector('div.alert.alert-success')
      end

      scenario 'I can edit tab fields' do
        tab_edited = attributes_for(:course_assessment_tab)

        visit course_admin_assessments_path(course)

        title_field = find(:css, "#{content_tag_selector(tab)} input.tab_title")
        weight_field = find(:css, "#{content_tag_selector(tab)} input.tab_weight")

        expect(title_field.value).to eq(tab.title)
        expect(weight_field.value.to_i).to eq(tab.weight)

        title_field.set(tab_edited[:title])
        weight_field.set(tab_edited[:weight])
        click_button 'submit'

        expect(page).
          to have_selector('div.alert.alert-success',
                           text: "x#{I18n.t('course.admin.assessment_settings.update.success')}")
        expect(title_field.value).to eq(tab_edited[:title])
        expect(weight_field.value.to_i).to eq(tab_edited[:weight])
      end

      scenario 'I can delete a tab' do
        tab2 = create(:course_assessment_tab, course: course, category: category)

        visit course_admin_assessments_path(course)
        find_link(nil,
                  href: course_admin_assessments_category_tab_path(course, category, tab)).click
        expect(page).to have_selector('div.alert.alert-success')
        expect(page).to have_no_content_tag_for(tab)
        expect(page).to have_content_tag_for(tab2)
      end

      scenario 'I cannot delete the last tab of the last category' do
        visit course_admin_assessments_path(course)
        find_link(nil,
                  href: course_admin_assessments_category_tab_path(course, category, tab)).click
        expect(page).to have_selector('div.alert.alert-danger')
        expect(page).to have_content_tag_for(tab)
      end
    end
  end
end
