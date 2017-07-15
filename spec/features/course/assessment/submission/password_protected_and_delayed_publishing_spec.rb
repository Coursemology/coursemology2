# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessment: Submissions: Exam' do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) do
      create(:assessment, :published_with_mrq_question, :delay_grade_publication,
             course: course, password: 'super_secret')
    end
    let(:mrq_questions) { assessment.reload.questions.map(&:specific) }
    let(:student) { create(:course_student, course: course).user }
    let(:submission) do
      create(:submission, assessment: assessment, creator: student)
    end

    before { login_as(user, scope: :user) }

    context 'As a Course Student' do
      let(:user) { student }

      scenario 'I need to input the password when using a different session ', js: true do
        assessment
        visit course_assessments_path(course)

        within find(content_tag_selector(assessment)) do
          find_link(
            I18n.t('course.assessment.assessments.assessment_management_buttons.attempt')
          ).trigger('click')
        end
        # The user should be redirect to submission edit page
        expect(page).to have_selector('div#submission-edit')

        submission = assessment.submissions.last

        # Logout and login again and visit the same submission
        logout
        login_as(user)

        visit edit_course_assessment_submission_path(course, assessment, submission)

        expect(page).to have_selector('div.password-panel')

        fill_in 'session_password', with: 'wrong_password'
        click_button I18n.t('course.assessment.sessions.new.continue')
        expect(current_path).to eq(new_course_assessment_session_path(course, assessment))

        fill_in 'session_password', with: assessment.password
        click_button I18n.t('course.assessment.sessions.new.continue')

        expect(page).to have_selector('div#submission-edit')
      end

      pending 'I can edit and save my submission', js: true do
        submission
        visit edit_course_assessment_submission_path(course, assessment, submission)

        fill_in 'session_password', with: assessment.password
        click_button I18n.t('course.assessment.sessions.new.continue')
        expect(page).to have_selector('h1', text: assessment.title)

        option = assessment.questions.first.actable.options.first.option
        check option
        click_button I18n.t('course.assessment.submission.submissions.buttons.save')

        expect(current_path).to eq(
          edit_course_assessment_submission_path(course, assessment, submission)
        )
        expect(page).to have_checked_field(option)
      end
    end

    context 'As a Course Staff' do
      let(:user) { create(:course_teaching_assistant, course: course).user }

      pending 'I can submit the grading for publishing' do
        mrq_questions.each { |q| q.attempt(submission).save! }
        submission.finalise!
        submission.save!

        visit edit_course_assessment_submission_path(course, assessment, submission)

        # Grade the submission with empty answer grade
        click_button I18n.t('course.assessment.submission.submissions.buttons.mark')
        expect(page).to have_selector('div.alert-danger')
        expect(page).to have_button(I18n.t('course.assessment.submission.submissions.buttons.mark'))

        fill_in find('input.form-control.grade')[:name], with: 0
        fill_in 'submission[draft_points_awarded]', with: 50

        click_button I18n.t('course.assessment.submission.submissions.buttons.mark')
        expect(page).to have_button(I18n.t('course.assessment.submission.submissions.buttons.save'))

        expect(current_path).
          to eq(edit_course_assessment_submission_path(course, assessment, submission))
        expect(submission.reload.graded?).to be_truthy
        expect(submission.points_awarded).to be_nil
        expect(submission.draft_points_awarded).to eq(50)
      end
    end
  end
end
