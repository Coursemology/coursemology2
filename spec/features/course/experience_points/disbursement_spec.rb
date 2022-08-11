# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Experience Points: Disbursement' do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:course_students) { create_list(:course_student, 4, course: course) }
    let(:course_teaching_assistant) { create(:course_teaching_assistant, course: course) }

    before { login_as(user, scope: :user) }

    context 'As a Course Teaching Assistant', js: true do
      let(:user) { course_teaching_assistant.user }

      scenario 'I can filter students by group' do
        group1, group2 = create_list(:course_group, 2, course: course)
        group1_student, group2_student, ungrouped_student = course_students
        create(:course_group_user, group: group1, course_user: group1_student)
        create(:course_group_user, group: group2, course_user: group2_student)

        visit disburse_experience_points_course_users_path(course)
        find('button#general-disbursement-tab').click
        course_students.each do |student|
          expect(page).to have_selector("tr.course_user_#{student.id}")
        end

        find('div.filter-group').click
        find('li', text: group1.name).click
        expect(page).to have_selector("tr.course_user_#{group1_student.id}")
        expect(page).to have_no_selector("tr.course_user_#{group2_student.id}")
        expect(page).to have_no_selector("tr.course_user_#{ungrouped_student.id}")
      end

      scenario 'I can copy points awarded for first student to all students', js: true do
        course_students
        visit disburse_experience_points_course_users_path(course)
        find('button#general-disbursement-tab').click

        first('tbody').first('tr').find('div.points_awarded').find('input').set '100'
        sleep 0.5 # Added due to debounced field

        find('.experience-points-disbursement-copy-button').click

        course_students.each do |student|
          points_awarded = find("tr.course_user_#{student.id}").find('div.points_awarded').find('input').value
          expect(points_awarded).to eq('100')
        end
      end

      scenario 'I can disburse experience points' do
        course_students

        visit disburse_experience_points_course_users_path(course)
        find('button#general-disbursement-tab').click

        find('div.experience_points_disbursement_reason').find('input').set('a reason')

        student_to_award_points, student_to_set_zero, student_to_set_one,
        student_to_leave_blank = course_students

        expect(page).to have_selector("tr.course_user_#{student_to_leave_blank.id}")
        find("tr.course_user_#{student_to_award_points.id}").find('div.points_awarded').find('input').set '100'
        find("tr.course_user_#{student_to_set_one.id}").find('div.points_awarded').find('input').set '1'
        find("tr.course_user_#{student_to_set_zero.id}").find('div.points_awarded').find('input').set '0'
        sleep 0.5 # Added due to debounced field

        expect do
          find('button.general-btn-submit').click
          sleep 0.5
        end.to change(Course::ExperiencePointsRecord, :count).by(2)
      end
    end
  end
end
