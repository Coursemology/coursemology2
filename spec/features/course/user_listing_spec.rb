# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Courses: Course User Listing' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let!(:course_student_list) { create_list(:course_student, 5, :approved, course: course) }
    let!(:unregistered_user) { create(:course_user, course: course) }
    let!(:course_teaching_assistant) do
      create(:course_teaching_assistant, :approved, course: course)
    end

    context 'As a Course Student' do
      let(:student) { create(:course_student, :approved, course: course) }
      before { login_as(student.user, scope: :user) }

      scenario 'I can view all confirmed students in my course' do
        visit course_users_path(course)

        course_student_list.each do |student|
          expect(page).to have_content_tag_for(student)
          expect(page).to have_link(nil, href: course_user_path(course, student))
        end

        # Page should not display unconfirmed users and teaching assistants
        expect(page).not_to have_content_tag_for(unregistered_user)
        expect(page).not_to have_content_tag_for(course_teaching_assistant)
      end
    end
  end
end
