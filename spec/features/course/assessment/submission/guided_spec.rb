# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessment: Submissions: Guided' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, :guided, :with_all_question_types, course: course) }
    before { login_as(user, scope: :user) }

    let(:student) { create(:course_user, :approved, course: course).user }
    let(:submission) do
      create(:course_assessment_submission, assessment: assessment, user: student)
    end

    context 'As a Course Student' do
      let(:user) { student }

      scenario 'I can navigate between questions' do
        # Add a correct answer to the first question
        answer = assessment.questions.first.attempt(submission)
        answer.correct = true
        answer.save

        visit edit_course_assessment_submission_path(course, assessment, submission)

        1..assessment.questions.length do |step|
          path = edit_course_assessment_submission_path(course, assessment, submission,
                                                        step: step)
          expect(page).to have_link(step, href: path)
        end

        # TODO: Add more asserts once questions are displayed in guided assessment.
      end

      scenario 'I can submit an answer for auto grading' do
        assessment = create(:assessment, :with_mcq_question, :guided, course: course)
        submission = create(:course_assessment_submission, assessment: assessment, user: student)
        visit edit_course_assessment_submission_path(course, assessment, submission)
        check 'true'
        click_button I18n.t('common.save')
        expect(page).to have_selector('div.alert-success',
                                      text: 'course.assessment.submission.submissions.update.'\
                                            'success')

        click_button I18n.t('common.submit')
        wait_for_job

        expect(page).to have_selector('div', text: 'course.assessment.answer.grading.grading')
        expect(page).to have_selector('div', text: 'course.assessment.answer.grading.grade')
      end

      scenario 'I can submit an answer for auto grading' do
        assessment = create(:assessment, :with_mcq_question, :guided, course: course)
        submission = create(:course_assessment_submission, assessment: assessment, user: student)
        # Create an incorrect answer
        create(:course_assessment_answer_multiple_response, :graded,
               correct: false, question: assessment.questions.first, submission: submission)

        visit edit_course_assessment_submission_path(assessment.course, assessment, submission)

        expect(page).not_to have_button(I18n.t('common.save'))
        expect(page).not_to have_button(I18n.t('common.submit'))

        click_button I18n.t('course.assessment.answer.guided.reattempt')
        expect(page).to have_button(I18n.t('common.save'))
        expect(page).to have_button(I18n.t('common.submit'))
      end
    end
  end
end
