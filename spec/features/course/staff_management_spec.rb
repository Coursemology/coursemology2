# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Courses: Staff Management', js: true do
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

        expect(find_sidebar).not_to have_selector('#sidebar_item_admin_users_manage_users')
      end
    end

    context 'As a Course Teaching Assistant' do
      let(:user) { create(:user) }
      let!(:course_staff) { create(:course_teaching_assistant, course: course, user: user) }

      scenario 'I can view the Users Management Sidebar item' do
        visit course_path(course)

        expect(find_sidebar).to have_selector('#sidebar_item_admin_users_manage_users')
      end

      scenario 'I cannot access the staff list' do
        visit course_users_staff_path(course)

        expect_forbidden
      end
    end

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can view the Users Management Sidebar item' do
        visit course_path(course)

        expect(find_sidebar).to have_selector('#sidebar_item_admin_users_manage_users')
      end

      scenario 'I can view the list of staff' do
        visit course_users_staff_path(course)

        course_students.each do |student|
          expect(page).not_to have_selector("tr.course_user_#{student.id}")
        end

        course_managers.each do |staff|
          expect(page).to have_selector("tr.course_user_#{staff.id}")
        end
      end

      scenario 'I can change staff name and role' do
        new_name = 'new staff name'
        staff_to_change = course_managers.sample
        visit course_users_staff_path(course)

        # change name
        within find("tr.course_user_#{staff_to_change.id}") do
          find('button.inline-edit-button', visible: false).click
          find('input').set(new_name)
          find('button.confirm-btn').click
        end
        expect_toastify("#{staff_to_change.name} was renamed to #{new_name}")

        # change role
        within find("tr.course_user_#{staff_to_change.id}") do
          find('div.course_user_role').click
        end
        page.all('li.MuiMenuItem-root')[3].click # option id "role-#{staff_to_change.id}-owner" can't be targeted...

        expect_toastify("Updated #{new_name}'s role to Owner.")

        expect(staff_to_change.reload).to be_owner
        expect(staff_to_change.name).to eq(new_name)
      end

      scenario 'I can upgrade students to staff' do
        visit course_users_staff_path(course)

        staff_to_be = course_students[0]

        page.all('div.course_user_name > input') do |input|
          expect(input).to_not_have staff_to_be.name
        end

        find('#upgrade-student-name').click
        find('#upgrade-student-name-option-0').select_option
        find('button.MuiAutocomplete-popupIndicator').click # close the autocomplete popup

        click_button 'Upgrade to staff'

        expect_toastify('1 new user has been upgraded to Teaching Assistant')

        within find("tr.course_user_#{staff_to_be.id}") do
          expect(find('div.course_user_name').text).to eq(staff_to_be.name)
        end
      end

      scenario 'I can delete staff' do
        staff_to_delete = course_managers.sample
        visit course_users_staff_path(course)

        expect do
          find("button.user-delete-#{staff_to_delete.id}").click
          accept_prompt
        end.to change { page.all('tr.course_user').count }.by(-1)

        expect(page).to_not have_selector('div.course_user_name', text: staff_to_delete.name)
      end
    end
  end
end
