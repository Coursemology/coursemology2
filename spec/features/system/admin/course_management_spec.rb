# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'System: Administration: Courses', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let!(:courses) do
      courses = create_list(:course, 2)
      other_instance = create(:instance)
      courses.first.update_column(:instance_id, other_instance.id)
      Course.unscoped.ordered_by_title.first(15)
    end
    let(:active_course) do
      course = create(:course)
      create_list(:course_student, 5, last_active_at: 1.day.ago, course: course)
      course
    end
    let(:inactive_course) do
      Course.unscoped.where.not(id: Course.unscoped.active_in_past_7_days.pluck(:id)).sample || create(:course)
    end

    context 'As a System Administrator' do
      let(:admin) { create(:administrator) }
      before { login_as(admin, scope: :user) }

      scenario 'I can view courses in the system' do
        visit admin_courses_path
        courses.each do |course|
          expect(page).to have_selector("tr.course_#{course.id}", text: course.title)
          expect(page).
            to have_link(nil, href: "//#{course.instance.host}/courses/#{course.id}")
        end
      end

      scenario 'I can filter only active courses' do
        active_course
        inactive_course

        visit admin_courses_path

        within find('p', text: 'Active Courses', exact_text: false) do
          find_all('a').first.click
        end

        search_field = find_field('Search courses by title or owner')

        search_field.set(active_course.title)
        expect(page).to have_link(
          active_course.title,
          href: "//#{active_course.instance.host}/courses/#{active_course.id}"
        )

        search_field.set(inactive_course.title)
        expect(page).not_to have_text(inactive_course.title)
      end

      scenario 'I can delete a course' do
        course_to_delete = create(:course, title: Course.unscoped.ordered_by_title.first.title)
        visit admin_courses_path

        expect_delete_action = expect do
          find("button.course-delete-#{course_to_delete.id}").click
          expect(page).to have_button('Delete course', disabled: true)
          fill_in 'confirmDeleteField', with: 'coursemology'
          click_button('Delete course')
          expect_toastify("#{course_to_delete.title} was deleted.")
        end

        expect_delete_action.to change(instance.courses, :count).by(-1)
      end

      scenario 'I can search courses' do
        skip 'Flaky tests'
        course_to_search = create(:course)

        visit admin_courses_path
        wait_for_page
        find_button('Search').click
        find('div[aria-label="Search"]').find('input').set(course_to_search.title)

        wait_for_field_debouncing # timeout for search debouncing

        expect(page).to have_selector('p.course_title', text: course_to_search.title)
        expect(all('.course').count).to eq(1)
      end
    end
  end
end
