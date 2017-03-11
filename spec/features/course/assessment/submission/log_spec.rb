# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessment: Submissions: Logs' do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, :published_with_mrq_question, course: course) }
    let(:protected_assessment) do
      create(:assessment, :published_with_mrq_question,
             course: course, password: 'super_secret')
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

      scenario 'My access to the password-protected assessment is logged' do
        protected_assessment
        visit course_assessments_path(course)

        within find(content_tag_selector(protected_assessment)) do
          find_link(
            I18n.t('course.assessment.assessments.assessment_management_buttons.attempt')
          ).click
        end

        submission = protected_assessment.submissions.last
        expect(submission.logs.count).to equal(1)

        expect do
          visit edit_course_assessment_submission_path(course, protected_assessment, submission)
        end.not_to change { submission.logs.count }

        # Logout and login again and visit the same submission
        logout
        login_as(user)

        expect do
          visit edit_course_assessment_submission_path(course, protected_assessment, submission)
        end.to change { submission.logs.count }.by(1)

        expect do
          fill_in 'session_password', with: protected_assessment.password
          click_button I18n.t('course.assessment.sessions.new.continue')
        end.to change { submission.logs.count }.by(1)
      end

      scenario 'My access to the unprotected assessment is not logged' do
        assessment
        visit course_assessments_path(course)

        within find(content_tag_selector(assessment)) do
          find_link(
            I18n.t('course.assessment.assessments.assessment_management_buttons.attempt')
          ).click
        end

        submission = assessment.submissions.last
        expect(submission.logs.count).to equal(0)

        expect do
          visit edit_course_assessment_submission_path(course, assessment, submission)
        end.not_to change { submission.logs.count }
      end
    end

    context 'As a Course Staff' do
      let(:user) { create(:course_teaching_assistant, course: course).user }

      scenario 'I can view the access logs for a submission' do
        protected_assessment
        submission
        submission_logs

        visit course_assessment_submission_logs_path(course, protected_assessment, submission)

        expect(page).
          to have_selector('h1', text: I18n.t('course.assessment.submission.logs.index.header'))
      end
    end
  end
end
