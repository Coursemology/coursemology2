# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessment: Submissions: Logs', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, :published_with_mrq_question, course: course) }
    let(:protected_assessment) do
      create(:assessment, :published_with_mrq_question,
             course: course, session_password: 'super_secret')
    end
    let(:student) { create(:course_student, course: course).user }
    let(:submission) do
      create(:submission, assessment: protected_assessment, creator: student)
    end
    let(:submission_logs) do
      create_list(:course_assessment_submission_log, 5, submission: submission)
    end

    before { login_as(user, scope: :user) }

    context 'As a Course Student' do
      let(:user) { student }
      let(:protected_submission) { protected_assessment.submissions.last }
      let(:last_submission) { assessment.submissions.last }

      scenario 'My access to the password-protected assessment is logged' do
        protected_assessment
        visit course_assessments_path(course)

        within find('tr', text: protected_assessment.title) do
          click_link 'Attempt'
        end
        wait_for_page

        expect(protected_submission.logs.count).to equal(1)
        expect(protected_submission.logs.last.valid_attempt?).to be(true)

        expect do
          visit edit_course_assessment_submission_path(course, protected_assessment, protected_submission)
        end.not_to(change { protected_submission.logs.count })

        # Logout and login again and visit the same submission
        click_on 'OK'
        perform_logout_in_course CourseUser.for_user(user).first.name

        login_as(user)
        wait_for_page

        expect do
          visit edit_course_assessment_submission_path(course, protected_assessment, protected_submission)
        end.to change { protected_submission.logs.count }.by(1)
        expect(protected_submission.logs.last.valid_attempt?).to be(false)

        expect do
          fill_in 'password', with: protected_assessment.session_password
          click_button('Submit')
        end.to change { protected_submission.logs.count }.by(1)
        wait_for_page

        expect(protected_submission.logs.last.valid_attempt?).to be(true)
      end

      scenario 'My access to the unprotected assessment is not logged' do
        assessment
        visit course_assessments_path(course)

        within find('tr', text: assessment.title) do
          click_link 'Attempt'
        end
        wait_for_page

        expect(last_submission.logs.count).to equal(0)

        expect do
          visit edit_course_assessment_submission_path(course, assessment, last_submission)
        end.not_to(change { last_submission.logs.count })
      end
    end

    context 'As a Course Staff' do
      let(:user) { create(:course_teaching_assistant, course: course).user }

      scenario 'I can view the access logs for a submission' do
        protected_assessment
        submission
        submission_logs

        visit course_assessment_submission_logs_path(course, protected_assessment, submission)

        expect(page).to have_text 'Access Logs'
      end
    end
  end
end
