# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Courses: Experience Points Records: Management' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:course_student) { create(:course_student, :approved, course: course) }
    let(:record) { create(:submission, course: course, creator: course_student.user).acting_as }
    let(:manual_record) { create(:course_experience_points_record, course_user: course_student) }
    let(:inactive_record) do
      create(:course_experience_points_record, :inactive, course_user: course_student)
    end
    let(:records) { [record, manual_record, inactive_record] }

    before { login_as(user, scope: :user) }

    context 'As a Course manager' do
      let(:user) { create(:course_manager, :approved, course: course).user }

      scenario "I can view a course student's active experience points records" do
        records
        visit course_user_experience_points_records_path(course, course_student)

        expect(page).to have_content_tag_for(record)
        expect(page).to have_content_tag_for(manual_record)
        expect(page).not_to have_content_tag_for(inactive_record)
      end

      scenario "I can delete a course student's active manually-awarded points records" do
        records
        visit course_user_experience_points_records_path(course, course_student)

        record_path =
          course_user_experience_points_record_path(course, course_student, record)
        manual_record_path =
          course_user_experience_points_record_path(course, course_student, manual_record)

        expect(page).not_to have_link(nil, href: record_path)
        find_link(nil, href: manual_record_path).click
        expect(current_path).
          to eq(course_user_experience_points_records_path(course, course_student))
        expect(page).not_to have_content_tag_for(manual_record)
      end
    end

    context 'As a Course student' do
      let(:user) { course_student.user }

      scenario 'I can view my active experience points records' do
        records
        visit course_user_experience_points_records_path(course, course_student)

        expect(page).to have_content_tag_for(record)
        expect(page).to have_content_tag_for(manual_record)
        expect(page).not_to have_content_tag_for(inactive_record)
      end
    end
  end
end
