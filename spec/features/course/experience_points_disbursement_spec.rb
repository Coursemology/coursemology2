# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Experience Points Disbursement' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:unapproved_course_student) { create(:course_student, course: course) }
    let(:course_students) { create_list(:course_student, 3, :approved, course: course) }
    let(:course_teaching_assistant) do
      create(:course_teaching_assistant, :approved, course: course)
    end

    before { login_as(user, scope: :user) }

    context 'As a Course Teaching Assistant' do
      let(:user) { course_teaching_assistant.user }

      scenario 'I can disburse experience points' do
        unapproved_course_student
        unawarded_student, awarded_student, awarded_zero_student = course_students
        visit disburse_experience_points_course_users_path(course)

        fill_in 'experience_points_disbursement_reason', with: 'a reason'

        expect(page).not_to have_content_tag_for(unapproved_course_student)
        expect(page).to have_content_tag_for(unawarded_student)
        within find(content_tag_selector(awarded_student)) do
          find('input.points_awarded').set '100'
        end
        within find(content_tag_selector(awarded_zero_student)) do
          find('input.points_awarded').set '00'
        end

        expect do
          click_button I18n.t('course.experience_points_disbursement.new.submit')
        end.to change(Course::ExperiencePointsRecord, :count).by(1)

        expect(current_path).to eq(disburse_experience_points_course_users_path(course))
      end
    end
  end
end
