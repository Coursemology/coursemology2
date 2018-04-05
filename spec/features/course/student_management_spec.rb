# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Courses: Students' do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:user) { create(:course_manager, course: course).user }
    let!(:course_students) { create_list(:course_student, 3, course: course) }
    before { login_as(user, scope: :user) }

    scenario 'Course staff can view the list of students registered' do
      visit course_users_students_path(course)

      course_students.each do |course_user|
        expect(page).to have_field('course_user_name', with: course_user.name)
      end
    end

    scenario "Course staff can update students' records", js: true do
      student_to_update = course_students.sample
      new_name = 'NewNamePerson'

      visit course_users_students_path(course)

      within find(content_tag_selector(student_to_update)) do
        fill_in 'course_user_name', with: new_name
        check 'course_user_phantom'
        click_button 'update'
      end

      wait_for_ajax

      student_to_update = student_to_update.reload
      expect(student_to_update).to be_phantom
      expect(student_to_update.name).to eq(new_name)
      expect(page).to have_text('course.users.update.success')
    end

    scenario 'Course staff can delete students' do
      user_to_delete = course_students.first

      visit course_users_students_path(course)
      expect do
        find_link(nil, href: course_user_path(course, user_to_delete)).click
      end.to change { page.all('.course_user').count }.by(-1)
      expect(page).to_not have_field('course_user_name', with: user_to_delete.name)
    end
  end
end
