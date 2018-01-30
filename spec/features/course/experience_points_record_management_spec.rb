# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Courses: Experience Points Records: Management' do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:course_student) { create(:course_student, course: course) }
    let(:submission) do
      create(:submission, :published, course: course, creator: course_student.user)
    end
    let(:record) { submission.acting_as }
    let(:manual_record) do
      # Set the updater to a user not in the course to make sure the page still works in this case.
      record = create(:course_experience_points_record, course_user: course_student)
      record.update_column(:updater_id, create(:user).id)
      record
    end
    let(:inactive_record) do
      create(:course_experience_points_record, :inactive, course_user: course_student)
    end
    let(:records) { [record, manual_record, inactive_record] }

    before { login_as(user, scope: :user) }

    context 'As a Course manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario "I can view a course student's active experience points records" do
        records
        visit course_user_experience_points_records_path(course, course_student)

        expect(page).to have_content_tag_for(record)
        expect(page).to have_content_tag_for(manual_record)
        expect(page).to have_no_content_tag_for(inactive_record)
        submission_path =
          edit_course_assessment_submission_path(course, submission.assessment, submission)
        expect(page).to have_link(submission.assessment.title, href: submission_path)
      end

      scenario "I can update a course student's active manually-awarded points records", js: true do
        records
        visit course_user_experience_points_records_path(course, course_student)

        within find(content_tag_selector(record)) do
          expect(page).to have_field('experience_points_record_points_awarded')
          expect(page).not_to have_field('experience_points_record_reason')
          expect(page).to have_button('update')
        end

        updated_points = manual_record.points_awarded + 1
        updated_reason = 'updated reason'
        within find(content_tag_selector(manual_record)) do
          fill_in 'experience_points_record_points_awarded', with: updated_points
          fill_in 'experience_points_record_reason', with: updated_reason
          click_button 'update'
        end

        wait_for_ajax

        update_success_message = I18n.t('course.experience_points_records.update.success')
        expect(page).to have_selector('div', text: update_success_message)
        expect(manual_record.reload.reason).to eq(updated_reason)
        expect(manual_record.points_awarded).to eq(updated_points)
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
        expect(page).to have_no_content_tag_for(manual_record)
      end
    end

    context 'As a Course student' do
      let(:user) { course_student.user }

      scenario 'I can view my active experience points records' do
        records
        visit course_user_experience_points_records_path(course, course_student)

        expect(page).to have_content_tag_for(record)
        expect(page).to have_content_tag_for(manual_record)
        expect(page).to have_no_content_tag_for(inactive_record)

        # Can view experience points attributes but cannot edit the experience points record
        within find(content_tag_selector(manual_record)) do
          expect(page).not_to have_field('experience_points_record_points_awarded')
          expect(page).not_to have_field('experience_points_record_reason')
          expect(page).not_to have_button('update')
        end
      end
    end
  end
end
