# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Courses: Staff Management' do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let!(:course_students) { create_list(:course_student, 2, course: course) }
    let!(:course_managers) { create_list(:course_manager, 2, course: course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Student' do
      let(:user) { create(:course_student, course: course).user }

      scenario 'I cannot view the Users Management Sidebar item' do
        visit course_path(course)

        expect(page).not_to have_selector('li', text: 'layouts.course_users.title')
      end
    end

    context 'As a Course Teaching Assistant' do
      let(:user) { create(:user) }
      let!(:course_staff) { create(:course_teaching_assistant, course: course, user: user) }

      scenario 'I can view the Users Management Sidebar item' do
        visit course_path(course)

        expect(page).to have_selector('li', text: 'layouts.course_users.title')
      end

      scenario 'I cannot access the staff list' do
        visit course_users_staff_path(course)
        expect(page.status_code).to eq(403)
      end
    end

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can view the Users Management Sidebar item' do
        visit course_path(course)

        expect(page).to have_selector('li', text: 'layouts.course_users.title')
      end

      scenario 'I can view the list of staff' do
        visit course_users_staff_path(course)

        course_students.each do |student|
          expect(page).not_to have_field('course_user_name', with: student.name)
        end

        course_managers.each do |staff|
          expect(page).to have_field('course_user_name', with: staff.name)
        end
      end

      scenario 'I can change staff roles', js: true do
        new_name = 'new staff name'
        staff_to_change = course_managers.sample
        visit course_users_staff_path(course)

        within find(content_tag_selector(staff_to_change)) do
          fill_in 'course_user_name', with: new_name, fill_options: { clear: :backspace }
          select 'owner'
          click_button 'update'
        end

        wait_for_ajax

        expect(staff_to_change.reload).to be_owner
        expect(staff_to_change.name).to eq(new_name)
        expect(page).to have_text('course.users.update.success')
      end

      scenario 'I can add new staff' do
        visit course_users_staff_path(course)

        staff_to_be = course_students[0]
        expect(page).not_to have_field('course_user_name', with: staff_to_be.name)

        find('#course_user_id').
          find(:css, "option[value='#{staff_to_be.id}']").
          select_option
        click_button I18n.t('course.users.staff.upgrade_to_staff')

        expect(page).to have_field('course_user_name', with: staff_to_be.name)
      end

      scenario 'I can delete staff' do
        staff_to_delete = course_managers.sample
        visit course_users_staff_path(course)

        expect do
          find_link(nil, href: course_user_path(course, staff_to_delete)).click
        end.to change { page.all('.course_user').count }.by(-1)
        expect(page).not_to have_field('course_user_name', with: staff_to_delete.name)
      end
    end
  end
end
