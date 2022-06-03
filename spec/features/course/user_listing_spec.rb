# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Courses: Course User Listing' do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let!(:course_student_list) { create_list(:course_student, 5, course: course) }
    let!(:phantom_user) { create(:course_student, :phantom, course: course) }
    let!(:course_teaching_assistant) { create(:course_teaching_assistant, course: course) }

    context 'As a Course Student', js: true do
      let(:student) { create(:course_student, course: course) }
      before { login_as(student.user, scope: :user) }

      scenario 'I can view all students in my course' do
        visit course_users_path(course)

        course_student_list.each do |student|
          expect(page).to have_selector("div.course-user-#{student.id}")
          expect(page).to have_link(nil, href: course_user_path(course, student))
        end

        # Page should not display users, phantom users and teaching assistants
        expect(page).to_not have_selector("div.course-user-#{phantom_user.id}")
        expect(page).to_not have_selector("div.course-user-#{course_teaching_assistant.id}")
      end
    end
  end
end
