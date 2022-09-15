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
          expect(page).to have_selector('p.course_title', text: course.title)
          expect(page).
            to have_link(nil, href: "/courses/#{course.id}")
        end
      end

      scenario 'I can filter only active courses' do
        active_course
        inactive_course

        visit admin_courses_path(active: 'true')

        find(:xpath, '//*[@id="system-admin-component"]/div[1]/div[4]/div[2]/div[2]/p[2]/span/button').click
        expect(page).to have_selector('p.course_title', text: active_course.title)
        expect(page).to have_link(nil, href: "/courses/#{active_course.id}")

        expect(page).not_to have_selector('p.course_title', text: inactive_course.title)
      end

      scenario 'I can delete a course' do
        course_to_delete = create(:course, title: Course.unscoped.ordered_by_title.first.title)
        visit admin_courses_path

        find("button.course-delete-#{course_to_delete.id}").click
        accept_confirm_dialog
        expect_toastify("#{course_to_delete.title} was deleted.")
      end

      scenario 'I can search courses' do
        course_to_search = create(:course)

        visit admin_courses_path
        find('button[aria-label="Search"]').click
        find('div[aria-label="Search"]').find('input').set(course_to_search.title)

        sleep 0.5 # timeout for search debouncing

        expect(page).to have_selector('p.course_title', text: course_to_search.title)
        expect(all('.course').count).to eq(1)
      end
    end
  end
end
