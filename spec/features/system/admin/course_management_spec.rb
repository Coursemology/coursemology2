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
    let!(:active_course) do
      course = create(:course)
      create_list(:course_student, 5, last_active_at: 1.day.ago, course: course)
      course
    end
    let!(:inactive_course) do
      Course.unscoped.where.not(id: Course.unscoped.active_in_past_7_days.pluck(:id)).sample || create(:course)
    end
    # use ordered_by_title.first ensure course is the first in the list to delete without need to search
    let!(:course_to_delete) { create(:course, title: Course.unscoped.ordered_by_title.first.title) }
    let!(:course_to_search) { create(:course) }

    context 'As a System Administrator' do
      let(:admin) { create(:administrator) }
      before { login_as(admin, scope: :user, redirect_url: admin_courses_path) }

      scenario 'I can view courses in the system' do
        courses.each do |course|
          expect(page).to have_selector("tr.course_#{course.id}", text: course.title)
          expect(page).
            to have_link(nil, href: "//#{course.instance.host}/courses/#{course.id}")
        end
      end

      scenario 'I can filter only active courses' do
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
        find_field('Search courses by title or owner').set(course_to_search.title)

        expect(page).to have_xpath('//tr/td/a', text: course_to_search.title)
        expect(page).to have_xpath('//tr[contains(@class, "course_")]', count: 1)
      end
    end
  end
end
