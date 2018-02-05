# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Experience Points: Disbursement' do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:course_students) { create_list(:course_student, 4, course: course) }
    let(:course_teaching_assistant) { create(:course_teaching_assistant, course: course) }

    before { login_as(user, scope: :user) }

    context 'As a Course Teaching Assistant' do
      let(:user) { course_teaching_assistant.user }

      scenario 'I can filter students by group' do
        group_1, group_2 = create_list(:course_group, 2, course: course)
        group_1_student, group_2_student, ungrouped_student = course_students
        create(:course_group_user, group: group_1, course_user: group_1_student)
        create(:course_group_user, group: group_2, course_user: group_2_student)

        visit disburse_experience_points_course_users_path(course)
        course_students.each do |student|
          expect(page).to have_content_tag_for(student)
        end

        click_link group_1.name
        expect(page).to have_content_tag_for(group_1_student)
        expect(page).to have_no_content_tag_for(group_2_student)
        expect(page).to have_no_content_tag_for(ungrouped_student)
      end

      scenario 'I can copy points awarded for first student to all students', js: true do
        course_students
        visit disburse_experience_points_course_users_path(course)

        first('.course_user').find('input.points_awarded').set '100'

        click_button 'experience-points-disbursement-copy-button'

        course_students.each do |student|
          points_awarded = find(content_tag_selector(student)).find('input.points_awarded').value
          expect(points_awarded).to eq('100')
        end
      end

      scenario 'I can disburse experience points' do
        course_students

        visit disburse_experience_points_course_users_path(course)

        fill_in 'experience_points_disbursement_reason', with: 'a reason'

        student_to_award_points, student_to_set_zero, student_to_set_one,
        student_to_leave_blank = course_students

        expect(page).to have_content_tag_for(student_to_leave_blank)
        find(content_tag_selector(student_to_award_points)).find('input.points_awarded').set '100'
        find(content_tag_selector(student_to_set_one)).find('input.points_awarded').set '1'
        find(content_tag_selector(student_to_set_zero)).find('input.points_awarded').set '0'

        expect do
          click_button I18n.t('course.experience_points.disbursement.new.submit')
        end.to change(Course::ExperiencePointsRecord, :count).by(2)

        expect(current_path).to eq(disburse_experience_points_course_users_path(course))
      end
    end
  end
end
