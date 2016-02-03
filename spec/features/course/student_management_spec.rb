# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Courses: Students' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:user) { create(:administrator) }
    let!(:course_students) { create_list(:course_student, 3, :approved, course: course) }
    let!(:unregistered_user) { create(:course_user, course: course) }
    before { login_as(user, scope: :user) }

    scenario 'Course staff can view the list of students registered' do
      visit course_users_students_path(course)
      expect(page).not_to have_field('course_user_name', with: unregistered_user.name)

      course_students.each do |course_user|
        expect(page).to have_field('course_user_name', with: course_user.name)
      end
    end

    scenario "Course staff can change students' names" do
      new_name = 'NewNamePerson'.freeze

      visit course_users_students_path(course)
      within('form.edit_course_user:first') do
        fill_in 'course_user_name', with: new_name
        click_button 'update'
      end
      expect(page).to have_field('course_user_name', with: new_name)
    end

    scenario "Course staff can change students' phantom status" do
      user_to_change = course_students[Random.rand(course_students.length)]

      visit course_users_students_path(course)
      within find_field('course_user_name', with: user_to_change.name).find(:xpath, '../../..') do
        check 'course_user_phantom'
        click_button 'update'

        expect(page).to have_checked_field('course_user_phantom')
      end
    end

    scenario 'Course staff can delete students' do
      user_to_delete = course_students.first

      visit course_users_students_path(course)
      expect do
        find_link(nil, href: course_user_path(course, user_to_delete)).click
      end.to change { page.all('form.edit_course_user').count }.by(-1)
      expect(page).to_not have_field('course_user_name', with: user_to_delete.name)
    end
  end
end
