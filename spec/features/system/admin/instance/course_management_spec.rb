# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'System: Administration: Instance: Courses' do
  let(:instance) { create(:instance) }

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
          expect(page).to have_content_tag_for(course)
          expect(page).to have_link(nil, href: course_path(course))

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

        find_link(nil, href: admin_instance_course_path(course_to_delete)).click
        expect(page).
          to have_selector('div', text: I18n.t('system.admin.instance.courses.destroy.success'))
      end

      let!(:course_to_search) { create(:course) }
      scenario 'I can search courses' do
        visit admin_instance_courses_path

        fill_in 'search', with: course_to_search.title
        click_button I18n.t('layouts.search_form.search_button')

        expect(page).to have_content_tag_for(course_to_search)
        expect(all('.course').count).to eq(1)
      end
    end
  end
end
