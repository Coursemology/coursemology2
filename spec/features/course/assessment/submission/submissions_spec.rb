# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessment: Submissions: Submissions' do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, :with_all_question_types, course: course) }
    before { login_as(user, scope: :user) }

    let(:students) { create_list(:course_student, 4, course: course) }
    let(:phantom_student) { create(:course_student, :phantom, course: course) }
    let!(:submitted_submission) do
      create(:submission, :submitted,
             assessment: assessment, course: course, creator: students[0].user)
    end
    let!(:attempting_submission) do
      create(:submission, :attempting,
             assessment: assessment, course: course, creator: students[1].user)
    end
    let!(:published_submission) do
      create(:submission, :published,
             assessment: assessment, course: course, creator: students[2].user)
    end
    let!(:graded_submission) do
      create(:submission, :graded, assessment: assessment, course: course,
                                   creator: students[3].user)
    end

    context 'As a Course Staff' do
      let(:course_staff) { create(:course_teaching_assistant, course: course) }
      let!(:staff_submission) do
        create(:submission, :graded, assessment: assessment, course: course,
                                     creator: course_staff.user)
      end
      let(:user) { course_staff.user }
      let(:group_student) do
        # Create a group and add staff and student to group
        group = create(:course_group, course: course)
        create(:course_group_manager, course: course, group: group, course_user: course_staff)
        create(:course_group_student, course: course, group: group, course_user: students.sample)
      end

      # NOTE: Works locally but fails in CircleCI
      pending 'I can view all submissions of an assessment', js: true do
        phantom_student
        group_student
        visit course_assessment_submissions_path(course, assessment)

        expect(page).to have_text(/My Students/i)
        expect(page).to have_text(/Students/i)
        expect(page).to have_text(/Staff/i)

        find('#students-tab').click

        [submitted_submission, attempting_submission, published_submission, graded_submission].
          each do |submission|
          expect(page).to have_text(submission.course_user.name)
          expect(page).to have_text(submission.current_points_awarded) if submission.current_points_awarded
        end

        # Phantom student did not attempt submissions
        find('div.toggle-phantom').click
        expect(page).to have_text(phantom_student.name)
        expect(page).to have_text('Not Started')

        # Course staff attempted a submission
        find('#staff-tab').click
        expect(page).to have_text(staff_submission.course_user.name)
        expect(page).to have_text(staff_submission.current_points_awarded)

        # Course staff unsubmits own submission
        unsubmit_btn = "unsubmit-button-#{staff_submission.id}"
        expect(find_button(unsubmit_btn)).to be_present
        find_button(unsubmit_btn).click
        accept_confirm_dialog

        expect(page).to have_text('Attempting')
        expect(page).to_not have_button(unsubmit_btn)

        # Course staff deletes own attempt
        delete_btn = "delete-button-#{staff_submission.id}"
        expect(find_button(delete_btn)).to be_present
        find_button(delete_btn).click
        accept_confirm_dialog

        expect(page).not_to have_text('Attempting')
        expect(page).to_not have_button(delete_btn)
      end
    end

    context 'As a Course Manager' do
      let(:assessment) do
        create(:assessment, :with_all_question_types, :delay_grade_publication, course: course)
      end
      let(:user) { create(:course_manager, course: course).user }

      # NOTE: Works locally but fails in CircleCI
      pending 'I can publish all graded exams', js: true do
        visit course_assessment_submissions_path(course, assessment)
        find('#students-tab').click

        expect(page).to have_text('Graded but not published')
        click_button('Publish Grades')
        accept_confirm_dialog
        expect(page).not_to have_text('Graded but not published')

        expect(graded_submission.reload).to be_published
        expect(graded_submission.publisher).to eq(user)
        expect(graded_submission.published_at).to be_present
        expect(graded_submission.awarder).to be_present
        expect(graded_submission.awarded_at).to be_present
        expect(graded_submission.draft_points_awarded).to be_nil
        expect(graded_submission.points_awarded).not_to be_nil
      end

      # NOTE: Works locally but fails in CircleCI
      pending 'I can unsubmit all submissions', js: true do
        visit course_assessment_submissions_path(course, assessment)

        find('#students-tab').click
        find('#submission-dropdown-icon').click
        sleep 2
        expect(page).to have_css('.unsubmit-submissions-enabled')

        find('.unsubmit-submissions-enabled').click
        accept_confirm_dialog
        expect(page).not_to have_text('Graded but not published')

        find('#submission-dropdown-icon').click
        expect(page).not_to have_css('.unsubmit-submissions-enabled')
      end

      # NOTE: Works locally but fails in CircleCI
      pending 'I can delete all submissions', js: true do
        visit course_assessment_submissions_path(course, assessment)

        find('#students-tab').click
        find('#submission-dropdown-icon').click
        sleep 2
        expect(page).to have_css('.delete-submissions-enabled')

        find('.delete-submissions-enabled').click
        accept_confirm_dialog
        expect(page).to have_text('Not Started')
        expect(page).not_to have_text('Attempting')

        find('#submission-dropdown-icon').click
        expect(page).not_to have_css('.delete-submissions-enabled')
        expect(page).not_to have_css('.unsubmit-submissions-enabled')
      end
    end
  end
end
