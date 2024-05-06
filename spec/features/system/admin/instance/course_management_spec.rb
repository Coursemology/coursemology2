# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'System: Administration: Instance: Courses', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:last_page) { Course.unscoped.page.total_pages }
    let!(:courses) do
      courses = create_list(:course, 2)
      create(:course_manager, course: courses.sample)
      create(:course_student, course: courses.sample)

      courses
    end

    context 'As a Instance Administrator' do
      let(:admin) { create(:instance_administrator).user }
      before { login_as(admin, scope: :user) }

      scenario 'I can view all courses in the instance' do
        visit admin_instance_courses_path

        courses.each do |course|
          expect(page).to have_selector("tr.course_#{course.id}", text: course.title)
          expect(page).
            to have_link(nil, href: "//#{course.instance.host}/courses/#{course.id}")

          # It shows and only shows the owners
          course.course_users.owner.each do |course_user|
            expect(page).to have_selector('li', text: course_user.user.name)
          end

          course.course_users.reject(&:owner?).each do |course_user|
            expect(page).not_to have_selector('li', text: course_user.user.name)
          end
        end
      end

      let!(:course_to_delete) { create(:course) }
      scenario 'I can delete a course' do
        visit admin_instance_courses_path

        find("button.course-delete-#{course_to_delete.id}").click
        expect(page).to have_button('Delete course', disabled: true)
        fill_in 'confirmDeleteField', with: 'coursemology'
        click_button('Delete course')
        wait_for_page
        expect_toastify("#{course_to_delete.title} was deleted.")
      end

      let!(:course_to_search) { create(:course) }
      scenario 'I can search courses' do
        skip 'Flaky tests'
        visit admin_instance_courses_path

        find_button('Search').click
        find('div[aria-label="Search"]').find('input').set(course_to_search.title)

        wait_for_field_debouncing # timeout for search debouncing

        expect(page).to have_selector('p.course_title', text: course_to_search.title)
        expect(all('.course').count).to eq(1)
      end
    end
  end
end
