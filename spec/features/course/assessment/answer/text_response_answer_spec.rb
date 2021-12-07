# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessments: Submissions: Text Response Answers', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, :published_with_text_response_question, course: course) }
    before { login_as(user, scope: :user) }

    let(:submission) do
      create(:submission, *submission_traits, assessment: assessment, creator: user)
    end
    let(:submission_traits) { nil }

    context 'As a Course Student' do
      let(:user) { create(:course_student, course: course).user }
      let(:file_path) do
        File.join(Rails.root, '/spec/fixtures/files/text.txt')
      end

      scenario 'I cannot update my submission after finalising' do
        visit edit_course_assessment_submission_path(course, assessment, submission)

        answer_id = submission.answers.first.id
        find_field(name: "#{answer_id}[answer_text]").set('Test')
        click_button('Finalise Submission')
        accept_confirm_dialog do
          wait_for_job
        end
        expect(page).not_to have_field(name: "#{answer_id}[answer_text]")
      end

      scenario 'I upload an attachment to the answer' do
        visit edit_course_assessment_submission_path(course, assessment, submission)
        answer = submission.answers.last
        file_view = find('strong', text: 'Uploaded Files:').find(:xpath, '..')
        dropzone = find('.dropzone-input')
        file_input = dropzone.find('input', visible: false)

        file_input.set(file_path)

        # The file should show in the dropzone
        expect(dropzone).to have_css('span', text: 'text.txt')

        click_button('Save Draft')

        expect(dropzone).to have_no_css('span', text: 'text.txt')
        expect(file_view).to have_css('span', text: 'text.txt')
        expect(file_view).to have_css('span', count: 2)
        expect(answer.specific.attachments).not_to be_empty
      end

      scenario 'I cannot see the text box for a file upload question' do
        assessment = create(:assessment, :published_with_file_upload_question, course: course)
        submission = create(:submission, assessment: assessment, creator: user)

        visit edit_course_assessment_submission_path(course, assessment, submission)

        file_upload_answer = submission.answers.first
        expect(page).not_to have_field(name: "#{file_upload_answer.id}[answer_text]")
      end
    end
  end
end
