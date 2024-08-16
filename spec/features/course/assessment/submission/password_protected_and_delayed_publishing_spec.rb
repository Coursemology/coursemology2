# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessment: Submissions: Exam', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) do
      create(:assessment, :published_with_mrq_question, :delay_grade_publication,
             course: course, session_password: 'super_secret')
    end
    let(:mrq_questions) { assessment.reload.questions.map(&:specific) }
    let(:student) { create(:course_student, course: course).user }
    let(:submission) { create(:submission, :attempting, assessment: assessment, creator: student) }

    before { login_as(user, scope: :user) }

    context 'As a Course Student' do
      let(:user) { student }
      let(:last_submission) { assessment.submissions.last }

      scenario 'I need to input the password when using a different session ' do
        assessment
        visit course_assessments_path(course)

        within find('tr', text: assessment.title) do
          click_link 'Attempt'
        end

        # The user should be redirect to submission edit page
        wait_for_page
        expect(current_path).to eq(edit_course_assessment_submission_path(course, assessment, last_submission))
        click_button 'OK'

        # Logout and login again and visit the same submission
        logout
        login_as(user)

        visit edit_course_assessment_submission_path(course, assessment, last_submission)

        fill_in 'password', with: 'wrong_password'
        click_button('Submit')
        expect(current_path).to eq(new_course_assessment_session_path(course, assessment))

        fill_in 'password', with: assessment.session_password
        click_button('Submit')

        wait_for_page
        expect(current_path).to eq(edit_course_assessment_submission_path(course, assessment, last_submission))
      end

      scenario 'I can edit and save my submission' do
        submission
        visit edit_course_assessment_submission_path(course, assessment, submission)

        fill_in 'password', with: assessment.session_password
        click_button('Submit')

        click_button('OK')

        option = assessment.questions.first.actable.options.first
        expect(page).to have_selector('div', text: assessment.description)

        first(:checkbox, visible: false).set(true)

        wait_for_autosave
        expect(submission.current_answers.first.specific.reload.options).to include(option)
      end
    end

    context 'As a Course Staff' do
      let(:user) { create(:course_teaching_assistant, course: course).user }

      scenario 'I can submit the grading for publishing' do
        visit edit_course_assessment_submission_path(course, assessment, submission)

        mrq_questions.each { |q| q.attempt(submission).save! }
        submission.finalise!
        submission.save!

        visit current_path

        # Grade the submission with empty answer grade
        expect(page).to have_button('Submit for Publishing', disabled: true)
        find_field(class: 'grade').set(0)
        wait_for_autosave

        find_field(class: 'exp').set(50)

        click_button('Save')
        expect(page).to have_button('Submit for Publishing', disabled: false)
        click_button('Submit for Publishing')

        expect(current_path).
          to eq(edit_course_assessment_submission_path(course, assessment, submission))
        wait_for_page
        expect(submission.reload.points_awarded).to be_nil
        expect(submission.draft_points_awarded).to eq(50)
      end
    end
  end
end
