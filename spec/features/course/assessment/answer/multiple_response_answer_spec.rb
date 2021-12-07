# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessments: Submissions: Multiple Response Answers', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, :published_with_mrq_question, course: course) }
    before { login_as(user, scope: :user) }

    let(:submission) do
      create(:submission, *submission_traits, assessment: assessment, creator: user)
    end
    let(:submission_traits) { nil }
    let(:options) { assessment.questions.first.specific.options }
    let(:correct_option) { options.find(&:correct?).option }

    context 'As a Course Student' do
      let(:user) { create(:course_student, course: course).user }

      context 'when the question is a multiple choice question' do
        let(:assessment) { create(:assessment, :published_with_mcq_question, course: course) }

        scenario 'I can save my submission' do
          visit edit_course_assessment_submission_path(course, assessment, submission)

          option = assessment.questions.first.actable.options.first
          # Click correct answer
          page.
            find(:xpath, '//*[@id="course-assessment-submission"]/div[2]/div/form/div/div[3]/input', visible: false).
            click

          click_button('Save Draft')
          expect(current_path).to eq(
            edit_course_assessment_submission_path(course, assessment, submission)
          )
          sleep 0.1
          expect(page).to have_selector('span', text: 'Submission updated successfully.')
          expect(submission.current_answers.first.specific.reload.options).to include(option)
        end
      end

      context 'when the question is not a multiple choice question' do
        scenario 'I can save my submission' do
          visit edit_course_assessment_submission_path(course, assessment, submission)

          option = assessment.questions.first.actable.options.first
          expect(page).to have_selector('div', text: assessment.description)

          first(:checkbox, visible: false).set(true)
          click_button('Save Draft')

          expect(current_path).to eq(
            edit_course_assessment_submission_path(course, assessment, submission)
          )
          expect(page).to have_selector('span', text: 'Submission updated successfully.')
          expect(submission.current_answers.first.specific.reload.options).to include(option)
        end
      end

      scenario 'I cannot update my submission after finalising' do
        visit edit_course_assessment_submission_path(course, assessment, submission)

        click_button('Finalise Submission')
        accept_confirm_dialog do
          wait_for_job
        end
        expect(page).to have_field(type: 'checkbox', visible: false, disabled: true)
      end
    end

    context 'As Course Staff' do
      let(:user) { create(:course_teaching_assistant, course: course).user }
      let(:submission_traits) { :submitted }

      scenario 'I can view the correct answer' do
        visit edit_course_assessment_submission_path(course, assessment, submission)

        element = page.
                  find('#course-assessment-submission > div:nth-child(3)
                  > div > form > div > div:nth-child(5) > div > label > div')
        expect(element.style('background-color')['background-color']).to eq('rgba(232, 245, 233, 1)')
      end
    end
  end
end
