# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Courses: Students', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:user) { create(:course_manager, course: course).user }
    let!(:course_students) { create_list(:course_student, 3, course: course) }
    before { login_as(user, scope: :user) }

    scenario 'Course staff can view the list of students registered' do
      visit course_users_students_path(course)

      course_students.each do |course_user|
        expect(page).to have_selector("tr.course_user_#{course_user.id}")
      end
    end

    scenario "Course staff can update students' records" do
      student_to_update = course_students.sample
      new_name = 'new student name'

      visit course_users_students_path(course)

      # change name
      within find("tr.course_user_#{student_to_update.id}") do
        find('button.inline-edit-button', visible: false).click
        find('input').set(new_name)
        find('button.confirm-btn').click
      end
      expect_toastify("#{student_to_update.name} was renamed to #{new_name}")

      # change phantom
      within find("tr.course_user_#{student_to_update.id}") do
        find("#phantom-#{student_to_update.id}", visible: false).click
      end

      expect_toastify("#{new_name} is now a phantom user.")

      expect(student_to_update.reload).to be_phantom
      expect(student_to_update.name).to eq(new_name)
    end

    scenario 'Course staff can delete students' do
      user_to_delete = course_students.first
      visit course_users_students_path(course)

      expect do
        find("button.user-delete-#{user_to_delete.id}").click
        accept_prompt
      end.to change { page.all('tr.course_user').count }.by(-1)

      expect(page).to_not have_selector('div.course_user_name', text: user_to_delete.name)
    end
  end
end
