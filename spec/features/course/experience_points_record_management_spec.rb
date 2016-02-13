# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Courses: Experience Points Records: Management' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let!(:course) { create(:course) }
    let!(:course_student) { create(:course_student, :approved, course: course) }
    let!(:record) { create(:course_experience_points_record, course_user: course_student) }
    let(:reason) { 'Reasonable reason' }
    let(:points_awarded) { 100 }

    before { login_as(user, scope: :user) }

    context 'As a Course manager' do
      let(:user) { create(:course_manager, :approved, course: course).user }

      scenario 'I can manually award experience points' do
        visit new_course_course_user_experience_points_record_path(course, course_student)

        expect(page).to have_text(I18n.t('course.experience_points_records.new.header'))

        fill_in 'reason', with: reason
        fill_in 'points_awarded', with: points_awarded

        expect do
          click_button I18n.t('helpers.submit.experience_points_record.create')
        end.to change(course_student.experience_points_records, :count).by(1)
      end

      scenario "I can view a course student's experience points history" do
        visit course_course_user_experience_points_records_path(course, course_student)

        expect(page).to have_content_tag_for(record)
      end
    end

    context 'As a Course student' do
      let(:user) { course_student.user }

      scenario 'I can view my experience points history' do
        visit course_course_user_experience_points_records_path(course, course_student)

        expect(page).to have_content_tag_for(record)
      end
    end
  end
end
