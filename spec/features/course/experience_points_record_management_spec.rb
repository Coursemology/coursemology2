# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Courses: Experience Points Records: Management' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:course_student) { create(:course_student, :approved, course: course) }
    let!(:record) { create(:course_experience_points_record, course_user: course_student) }
    let!(:inactive_record) do
      create(:course_experience_points_record, :inactive, course_user: course_student)
    end

    before { login_as(user, scope: :user) }

    context 'As a Course manager' do
      let(:user) { create(:course_manager, :approved, course: course).user }

      scenario "I can view a course student's active experience points records" do
        visit course_course_user_experience_points_records_path(course, course_student)

        expect(page).to have_content_tag_for(record)
        expect(page).not_to have_content_tag_for(inactive_record)
      end
    end

    context 'As a Course student' do
      let(:user) { course_student.user }

      scenario 'I can view my active experience points records' do
        visit course_course_user_experience_points_records_path(course, course_student)

        expect(page).to have_content_tag_for(record)
        expect(page).not_to have_content_tag_for(inactive_record)
      end
    end
  end
end
