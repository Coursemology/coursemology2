# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Experience Points: Disbursement', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:course_students) { create_list(:course_student, 4, course: course) }
    let(:course_teaching_assistant) { create(:course_teaching_assistant, course: course) }

    before { login_as(user, scope: :user) }

    context 'As a Course Teaching Assistant' do
      let(:user) { course_teaching_assistant.user }

      scenario 'I can filter students by group' do
        group1, group2 = create_list(:course_group, 2, course: course)
        group1_student, group2_student, ungrouped_student = course_students
        create(:course_group_user, group: group1, course_user: group1_student)
        create(:course_group_user, group: group2, course_user: group2_student)

        visit course_experience_points_records_path(course)
        find('button', text: 'General Disbursement').click
        course_students.each do |student|
          expect(page).to have_selector("tr.course_user_#{student.id}")
        end

        find('.filter-group').click
        find('li', text: group1.name).click
        expect(page).to have_selector("tr.course_user_#{group1_student.id}")
        expect(page).to have_no_selector("tr.course_user_#{group2_student.id}")
        expect(page).to have_no_selector("tr.course_user_#{ungrouped_student.id}")

        find('div.experience_points_disbursement_reason').find('input').set('a reason')
        find("tr.course_user_#{group1_student.id}").find('div.points_awarded').find('input').set '59'

        expect do
          find('button.general-btn-submit').click
          wait_for_page
        end.to change(Course::ExperiencePointsRecord, :count).by(1)

        expect(group1_student.experience_points).to eq(59)
        expect(group2_student.experience_points).to eq(0)
        expect(ungrouped_student.experience_points).to eq(0)

        expect(group1_student.experience_points_records.first.reason).to eq('a reason')
        expect(group2_student.experience_points_records.size).to eq(0)
        expect(ungrouped_student.experience_points_records.size).to eq(0)
      end

      scenario 'I can copy points awarded for first student to all students' do
        course_students
        visit course_experience_points_records_path(course)
        find('button', text: 'General Disbursement').click

        first('tbody').first('tr').find('div.points_awarded').find('input').set '100'

        find('.experience-points-disbursement-copy-button').click

        find('div.experience_points_disbursement_reason').find('input').set('a reason')
        course_students.each do |student|
          points_awarded = find("tr.course_user_#{student.id}").find('div.points_awarded').find('input').value
          expect(points_awarded).to eq('100')
        end

        expect do
          find('button.general-btn-submit').click
          wait_for_page
        end.to change(Course::ExperiencePointsRecord, :count).by(course_students.length)

        course_students.each do |course_student|
          expect(course_student.experience_points).to eq(100)
          expect(course_student.experience_points_records.first.reason).to eq('a reason')
        end
      end

      scenario 'I can disburse experience points' do
        course_students

        visit course_experience_points_records_path(course)
        find('button', text: 'General Disbursement').click

        find('div.experience_points_disbursement_reason').find('input').set('a reason')

        student_to_award_points, student_to_set_zero, student_to_set_one,
        student_to_leave_blank = course_students

        expect(page).to have_selector("tr.course_user_#{student_to_leave_blank.id}")
        find("tr.course_user_#{student_to_award_points.id}").find('div.points_awarded').find('input').set '100'
        find("tr.course_user_#{student_to_set_one.id}").find('div.points_awarded').find('input').set '1'
        find("tr.course_user_#{student_to_set_zero.id}").find('div.points_awarded').find('input').set '0'

        expect do
          find('button.general-btn-submit').click
          wait_for_page
        end.to change(Course::ExperiencePointsRecord, :count).by(2)

        expect(student_to_award_points.experience_points).to eq(100)
        expect(student_to_award_points.experience_points_records.first.reason).to eq('a reason')

        expect(student_to_set_one.experience_points).to eq(1)
        expect(student_to_set_one.experience_points_records.first.reason).to eq('a reason')

        expect(student_to_set_zero.experience_points).to eq(0)
        expect(student_to_set_zero.experience_points_records.size).to eq(0)

        expect(student_to_leave_blank.experience_points).to eq(0)
        expect(student_to_leave_blank.experience_points_records.size).to eq(0)
      end
    end
  end
end
