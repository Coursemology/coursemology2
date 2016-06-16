# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Experience Points Disbursement' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:group) { create(:course_group, course: course) }
    let(:unapproved_course_student) { create(:course_student, course: course) }
    let(:ungrouped_course_student) { create(:course_student, :approved, course: course) }
    let(:grouped_course_students) do
      create_list(:course_group_user, 2, course: course, group: group).map(&:course_user)
    end
    let(:approved_course_students) { grouped_course_students + [ungrouped_course_student] }
    let(:course_teaching_assistant) do
      create(:course_teaching_assistant, :approved, course: course)
    end

    before { login_as(user, scope: :user) }

    context 'As a Course Teaching Assistant' do
      let(:user) { course_teaching_assistant.user }

      scenario 'I can filter students by group' do
        approved_course_students
        visit disburse_experience_points_course_users_path(course)
        approved_course_students.each do |student|
          expect(page).to have_content_tag_for(student)
        end

        click_link group.name
        expect(page).not_to have_content_tag_for(ungrouped_course_student)
        grouped_course_students.each do |student|
          expect(page).to have_content_tag_for(student)
        end
      end

      scenario 'I can disburse experience points' do
        approved_course_students
        unapproved_course_student
        visit disburse_experience_points_course_users_path(course)

        fill_in 'experience_points_disbursement_reason', with: 'a reason'

        student_to_award_points, student_to_set_zero, student_to_leave_blank = \
          approved_course_students

        expect(page).not_to have_content_tag_for(unapproved_course_student)
        expect(page).to have_content_tag_for(student_to_leave_blank)
        within find(content_tag_selector(student_to_award_points)) do
          find('input.points_awarded').set '100'
        end
        within find(content_tag_selector(student_to_set_zero)) do
          find('input.points_awarded').set '00'
        end

        # ExperiencePointsRecord is not created when points_awarded is zero
        expect do
          click_button I18n.t('course.experience_points_disbursement.new.submit')
        end.to change(Course::ExperiencePointsRecord, :count).by(1)

        expect(current_path).to eq(disburse_experience_points_course_users_path(course))
      end
    end
  end
end
