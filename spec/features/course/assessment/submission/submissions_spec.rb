# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessment: Submissions: Submissions', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, :with_all_question_types, course: course) }
    let(:mcq_assessment) { create(:assessment, :published, :with_mcq_question, course: course) }
    before { login_as(user, scope: :user) }

    let(:students) { create_list(:course_student, 5, course: course) }
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
      let!(:attempt_submission) do
        create(:submission, :attempting, assessment: mcq_assessment, course: course,
                                         creator: students[0].user)
      end
      let(:user) { course_staff.user }
      let(:group_student) do
        # Create a group and add staff and student to group
        group = create(:course_group, course: course)
        create(:course_group_manager, course: course, group: group, course_user: course_staff)
        create(:course_group_student, course: course, group: group, course_user: students.sample)
      end

      context 'when student is submitting the correct answer for prefillable question' do
        let(:options) { mcq_assessment.questions.first.specific.options }
        let(:correct_option) { options.find(&:correct?) }

        scenario 'I can directly publish prefilled grade' do
          login_as(students[0].user, scope: :user)
          # attempting the question in which grade is prefillable upon grading
          visit edit_course_assessment_submission_path(course, mcq_assessment, attempt_submission)
          find('label', text: correct_option.option).click
          wait_for_autosave

          click_button('Finalise Submission')
          click_button('Continue')
          wait_for_page

          # doing the login as staff now
          login_as(user, scope: :user)

          visit edit_course_assessment_submission_path(course, mcq_assessment, attempt_submission)
          wait_for_page

          click_button('Publish Grade')
          wait_for_page

          expect(page).to have_selector('span', text: 'Submission updated successfully.')

          # since the answer is correct, the submission's question should not have zero grade
          attempt_submission.answers.each do |answer|
            expect(answer.reload.grade).to eq(mcq_assessment.questions.first.maximum_grade)
          end
        end
      end

      scenario 'I can view all submissions of an assessment' do
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
        find('.toggle-phantom').click
        expect(page).to have_text(phantom_student.name)
        expect(page).to have_text('Not Started')

        # Course staff attempted a submission
        find('#staff-tab').click
        expect(page).to have_text(staff_submission.course_user.name)
        expect(page).to have_text(staff_submission.current_points_awarded)
      end

      scenario 'I can delete and unsubmit submissions of an assessment' do
        phantom_student
        group_student
        visit course_assessment_submissions_path(course, assessment)

        find('#staff-tab').click

        # Course staff unsubmits own submission
        unsubmit_btn = "unsubmit-button-#{staff_submission.course_user.id}"
        expect(find_button(unsubmit_btn)).to be_present
        find_button(unsubmit_btn).click
        accept_confirm_dialog

        expect(page).to have_text('Attempting')
        expect(page).to_not have_button(unsubmit_btn)

        # Course staff deletes own attempt
        delete_btn = "delete-button-#{staff_submission.course_user.id}"
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

      scenario 'I can publish all graded exams' do
        visit course_assessment_submissions_path(course, assessment)
        find('#students-tab').click

        expect(page).to have_text('Graded, unpublished')
        click_button('Publish Grades')
        accept_confirm_dialog
        wait_for_job
        expect(page).not_to have_text('Graded, unpublished')

        expect(graded_submission.reload).to be_published
        expect(graded_submission.publisher).to eq(user)
        expect(graded_submission.published_at).to be_present
        expect(graded_submission.awarder).to be_present
        expect(graded_submission.awarded_at).to be_present
        expect(graded_submission.draft_points_awarded).to be_nil
        expect(graded_submission.points_awarded).not_to be_nil
      end

      scenario 'I can force submit all unsubmitted exams' do
        visit course_assessment_submissions_path(course, assessment)
        find('#students-tab').click

        expect(page).to have_text('Attempting')
        expect(page).to have_text('Not Started')

        click_button('Force Submit Remaining')
        accept_confirm_dialog
        wait_for_job

        expect(page).not_to have_text('Attempting')
        expect(page).not_to have_text('Not Started')

        expect(assessment.submissions.length).to eq(5)
        expect(attempting_submission.reload).to be_graded
        expect(attempting_submission.grade).to eq(0)
        expect(attempting_submission.graded_at).to be_present
        expect(attempting_submission.draft_points_awarded).not_to be_nil
        expect(attempting_submission.points_awarded).to be_nil
      end

      scenario 'I can unsubmit all submissions' do
        visit course_assessment_submissions_path(course, assessment)

        find('#students-tab').click
        find('#submission-dropdown-icon').click
        wait_for_page
        expect(page).to have_css('.unsubmit-submissions-enabled')

        find('.unsubmit-submissions-enabled').click
        accept_confirm_dialog
        wait_for_job
        expect(page).not_to have_text('Graded, unpublished')

        find('#submission-dropdown-icon').click
        expect(page).not_to have_css('.unsubmit-submissions-enabled')
      end

      scenario 'I can delete all submissions' do
        visit course_assessment_submissions_path(course, assessment)

        find('#students-tab').click
        find('#submission-dropdown-icon').click
        wait_for_page
        expect(page).to have_css('.delete-submissions-enabled')

        find('.delete-submissions-enabled').click
        accept_confirm_dialog
        wait_for_job
        expect(page).to have_text('Not Started')
        expect(page).not_to have_text('Attempting')

        find('#submission-dropdown-icon').click
        expect(page).not_to have_css('.delete-submissions-enabled')
        expect(page).not_to have_css('.unsubmit-submissions-enabled')
      end
    end

    context 'When a student\'s submission of randomized assessment is deleted' do
      let(:user) { create(:course_manager, course: course).user }
      let(:randomized_assessment) do
        create(:assessment, :published, :with_all_question_types, randomization: 'prepared', course: course)
      end
      let!(:randomized_submission) do
        create(:submission, :submitted,
               assessment: randomized_assessment, course: course, creator: students[0].user)
      end
      let!(:question_group) do
        randomized_assessment.question_groups.create!(title: 'Test Group', weight: 1).tap do |group|
          group.question_bundles.create!(title: 'Test Bundle 1')
          group.question_bundles.create!(title: 'Test Bundle 2')
          group.question_bundles.create!(title: 'Test Bundle 3')
        end
      end
      let(:question_bundle_assignment) do
        assignment_randomizer =
          Course::Assessment::QuestionBundleAssignmentConcern::AssignmentRandomizer.new(randomized_assessment)
        assignment_set = assignment_randomizer.randomize
        assignment_randomizer.save(assignment_set)

        randomized_assessment.question_bundle_assignments.where(user: students[0].user).first
      end

      scenario 'I can delete the submission and the question bundle assignment is reset' do
        question_bundle_assignment.update(submission_id: randomized_submission.id)

        visit course_assessment_submissions_path(course, randomized_assessment)

        find('#students-tab').click
        delete_btn = "delete-button-#{randomized_submission.course_user.id}"
        expect(find_button(delete_btn)).to be_present
        find_button(delete_btn).click
        accept_confirm_dialog
        wait_for_job

        expect(page).to_not have_button(delete_btn)

        expect(randomized_assessment.submissions).to be_empty
        expect(question_bundle_assignment.reload.submission_id).to be_nil
      end

      scenario 'I can delete all submissions and the question bundle assignment is reset' do
        question_bundle_assignment.update(submission_id: randomized_submission.id)

        visit course_assessment_submissions_path(course, randomized_assessment)

        find('#students-tab').click
        delete_btn = "delete-button-#{randomized_submission.course_user.id}"
        expect(find_button(delete_btn)).to be_present

        find('#submission-dropdown-icon').click
        wait_for_page
        expect(page).to have_css('.delete-submissions-enabled')

        find('.delete-submissions-enabled').click
        accept_confirm_dialog
        wait_for_job
        wait_for_page
        expect(page).to_not have_button(delete_btn)

        expect(randomized_assessment.submissions).to be_empty
        expect(question_bundle_assignment.reload.submission_id).to be_nil
      end
    end
  end
end
