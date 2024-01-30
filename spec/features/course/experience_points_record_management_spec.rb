# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Courses: Experience Points Records: Management', js: true do
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
    let!(:records) { [record, manual_record, inactive_record] }

    before { login_as(user, scope: :user) }

    context 'As a Course manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario "I can view a course student's active experience points records" do
        visit course_user_experience_points_records_path(course, course_student)

        expect(page).to have_selector("#record-#{record.id}")
        expect(page).to have_selector("#record-#{manual_record.id}")
        expect(page).to have_no_selector("#record-#{inactive_record.id}")
        submission_path =
          edit_course_assessment_submission_path(course, submission.assessment, submission)
        expect(page).to have_link(submission.assessment.title, href: submission_path)
      end

      scenario "I can update a course student's active manually-awarded points records" do
        visit course_user_experience_points_records_path(course, course_student)

        within find("#record-#{record.id}") do
          expect(page).to have_selector("#points-#{record.id}")
          expect(page).not_to have_selector("#reason-#{record.id}")
          expect(page).to have_selector(".record-save-#{record.id}")
        end

        updated_points = manual_record.points_awarded + 1
        updated_reason = 'updated reason'
        within find("#record-#{manual_record.id}") do
          find("#points-#{manual_record.id}").set(updated_points)
          find("#reason-#{manual_record.id}").set(updated_reason)
          find("button.record-save-#{manual_record.id}").click
        end

        wait_for_page

        expect(manual_record.reload.reason).to eq(updated_reason)
        expect(manual_record.points_awarded).to eq(updated_points)
      end

      scenario "I can delete a course student's active manually-awarded points records" do
        visit course_user_experience_points_records_path(course, course_student)

        expect(page).not_to have_selector(".record-delete-#{record.id}")
        find("button.record-delete-#{manual_record.id}").click
        accept_prompt
        expect(current_path).
          to eq(course_user_experience_points_records_path(course, course_student))
        expect(page).to have_no_selector("#record-#{manual_record.id}")
      end
    end

    context 'As a Course student' do
      let(:user) { course_student.user }

      scenario 'I can view my active experience points records' do
        visit course_user_experience_points_records_path(course, course_student)

        expect(page).to have_selector("#record-#{record.id}")
        expect(page).to have_selector("#record-#{manual_record.id}")
        expect(page).to have_no_selector("#record-#{inactive_record.id}")

        # Can view experience points attributes but cannot edit the experience points record
        within find("#record-#{manual_record.id}") do
          expect(page).not_to have_selector("#points-#{manual_record.id}")
          expect(page).not_to have_selector("#reason-#{manual_record.id}")
          expect(page).not_to have_selector(".record-save-#{manual_record.id}")
        end
      end
    end
  end
end
