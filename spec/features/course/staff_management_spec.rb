# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Courses: Staff Management' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let!(:course_approved_students) { create_list(:course_student, 2, :approved, course: course) }
    let!(:course_unapproved_students) { create_list(:course_student, 2, course: course) }
    let!(:course_managers) { create_list(:course_manager, 2, :approved, course: course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Student' do
      let(:user) { create(:course_student, :approved, course: course).user }

      scenario 'I cannot view the Users Management Sidebar item' do
        visit course_path(course)

        expect(page).not_to have_selector('li', text: 'layouts.course_users.title')
      end
    end

    context 'As a Course Teaching Assistant' do
      let(:user) { create(:user) }
      let!(:course_staff) do
        create(:course_teaching_assistant, :approved, course: course, user: user)
      end

      scenario 'I cannot view the Users Management Sidebar item' do
        visit course_path(course)

        expect(page).not_to have_selector('li', text: 'layouts.course_users.title')
      end

      scenario 'I cannot access the staff list' do
        visit course_users_staff_path(course)
        expect(page.status_code).to eq(403)
      end
    end

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, :approved, course: course).user }

      scenario 'I can view the Users Management Sidebar item' do
        visit course_path(course)

        expect(page).to have_selector('li', text: 'layouts.course_users.title')
      end

      scenario 'I can view the list of staff' do
        visit course_users_staff_path(course)

        (course_approved_students + course_unapproved_students).each do |approved_student|
          expect(page).not_to have_field('course_user_name', with: approved_student.name)
        end

        course_managers.each do |staff|
          expect(page).to have_field('course_user_name', with: staff.name)
        end
      end

      scenario 'I can change staff role' do
        staff_to_change = course_managers[Random.rand(course_managers.length)]
        visit course_users_staff_path(course)

        field = find_field('course_user_name', with: staff_to_change.name)
        within field.find(:xpath, '../../../..') do
          fill_in 'course_user_name', with: staff_to_change.name + '!'
          select 'owner', from: 'course_user_role'
          find_button('update').click
        end

        expect(page).to have_field('course_user_name', with: staff_to_change.name + '!')
      end

      scenario 'I can delete staff' do
        staff_to_delete = course_managers[Random.rand(course_managers.length)]
        visit course_users_staff_path(course)

        expect do
          find_link(nil, href: course_user_path(course, staff_to_delete)).click
        end.to change { page.all('form.edit_course_user').count }.by(-1)
        expect(page).not_to have_field('course_user_name', with: staff_to_delete.name)
      end
    end
  end
end
