# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessments: Submissions: Programming Answers', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, :published_with_programming_question, course: course) }
    let(:submission) { create(:submission, *submission_traits, assessment: assessment, creator: user) }
    let(:submission_traits) { nil }

    before { login_as(user, scope: :user) }

    context 'As a Course Student' do
      let(:user) { create(:course_student, course: course).user }
      let(:submission_traits) { :attempting }
      let(:answer_code) { 'this is a testing code whatever lol' }

      scenario 'I can save my submission' do
        visit edit_course_assessment_submission_path(course, assessment, submission)

        find('div', class: 'ace_editor').click
        send_keys answer_code
        wait_for_autosave

        file = submission.answers.first.specific.files.reload.first
        expect(file.content).to eq(answer_code)
      end

      scenario 'I can only see public test cases but cannot update my finalized submission ' do
        create(:course_assessment_question_programming,
               assessment: assessment, test_case_count: 1, private_test_case_count: 1,
               evaluation_test_case_count: 1)

        visit edit_course_assessment_submission_path(course, assessment, submission)

        expect(page).to have_selector('.ace_editor')

        click_button 'Finalise Submission'
        click_button 'Continue'

        expect(page).not_to have_selector('.ace_editor')

        expect(page).to have_text('Public Test Cases')
        expect(page).not_to have_text('Private Test Cases')
        expect(page).not_to have_text('Evaluation Test Cases')
      end
    end

    context 'As Course Staff' do
      let(:user) { create(:course_teaching_assistant, course: course).user }

      context 'when submission is submitted' do
        let(:submission_traits) { :submitted }

        scenario 'I can view the test cases' do
          visit edit_course_assessment_submission_path(course, assessment, submission)

          assessment.questions.first.actable.test_cases.each do |test_case|
            expect(page).to have_text(test_case.identifier)
          end
        end
      end

      context 'when submission is attempting' do
        let(:submission) { create(:submission, :attempting, assessment: assessment, creator: user) }

        scenario 'I can view the test cases' do
          visit edit_course_assessment_submission_path(course, assessment, submission)

          assessment.questions.first.actable.test_cases.each do |test_case|
            expect(page).to have_text(test_case.identifier)
          end
        end
      end
    end
  end
end
