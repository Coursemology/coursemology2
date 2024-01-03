# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessments: Submissions: Text Response Answers', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:user) { create(:course_student, course: course).user }
    let(:submission) { create(:submission, :attempting, assessment: assessment, creator: user) }

    before { login_as(user, scope: :user) }

    context 'As a Course Student' do
      let(:file_path) { File.join(Rails.root, '/spec/fixtures/files/text.txt') }
      let(:json) { JSON.parse(response.body) }

      context 'when it is a file upload question' do
        let(:assessment) { create(:assessment, :published_with_text_response_question, course: course) }

        scenario 'I cannot update my submission after finalising' do
          visit edit_course_assessment_submission_path(course, assessment, submission)

          answer_id = submission.answers.first.id
          find_field(name: "#{answer_id}.answer_text").set('Test')
          click_button('Finalise Submission')
          accept_confirm_dialog do
            wait_for_job
          end
          expect(page).not_to have_field(name: "#{answer_id}[answer_text]")
        end

        scenario 'I upload an attachment to the answer' do
          visit edit_course_assessment_submission_path(course, assessment, submission)
          answer = submission.answers.last
          file_view = all('div', text: 'Uploaded Files').last
          dropzone = find('.dropzone-input')
          file_input = dropzone.find('input', visible: false)

          file_input.set(file_path)

          # The file should show in the dropzone
          expect(dropzone).to have_css('span', text: 'text.txt')

          # it's expected that after file's put here, autosave will be sent from FE to BE
          # therefore, we wait for autosave to finish and then proceed accordingly
          wait_for_autosave

          expect(dropzone).to have_no_css('span', text: 'text.txt')
          expect(file_view).to have_css('span', text: 'text.txt')
          expect(file_view).to have_css('span', count: 2)
          expect(answer.specific.attachments).not_to be_empty

          # Attempting to delete the file that we have just uploaded
          # Click on the delete button and confirm
          delete_button = file_view.find('svg[data-testId="CancelIcon"]')
          delete_button.click
          click_button('Delete')

          expect(page).to have_no_button('Delete')

          # It should indicate that there are no files uploaded
          # Original file in the question should have been deleted
          expect(file_view).to have_text('No files uploaded.')
          expect(file_view).to have_no_css('span', text: 'text.txt')
          expect(answer.specific.attachments).to be_empty
        end
      end

      context 'when it is a text response question' do
        let(:assessment) { create(:assessment, :published_with_file_upload_question, course: course) }

        scenario 'I cannot see the text box for a file upload question' do
          visit edit_course_assessment_submission_path(course, assessment, submission)

          file_upload_answer = submission.answers.first
          expect(page).not_to have_field(name: "#{file_upload_answer.id}[answer_text]")
        end
      end
    end
  end
end
