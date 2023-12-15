# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessments: Submissions: Programming File Submission Answers', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, :published, :with_programming_file_submission_question, course: course) }
    let(:submission) { create(:submission, :attempting, assessment: assessment, creator: user) }
    let(:submission2) { create(:submission, :attempting, assessment: assessment, creator: user) }

    before { login_as(user, scope: :user) }

    context 'As a Course Student' do
      let(:user) { create(:course_student, course: course).user }
      let(:file_path) do
        File.join(Rails.root, 'spec/fixtures/files/template_file')
      end
      let(:file_path2) do
        File.join(Rails.root, 'spec/fixtures/files/template_file_2')
      end

      scenario 'I can only upload new programming files' do
        visit edit_course_assessment_submission_path(course, assessment, submission)

        file_view = find('h6', text: 'Uploaded Files:').find(:xpath, '..')
        dropzone = find('.dropzone-input')
        file_input = dropzone.find('input', visible: false)

        # Stage the file to upload
        file_input.set(file_path)

        # The file should show in the dropzone
        expect(file_view).to have_css('span', count: 1)
        expect(dropzone).to have_css('span', text: 'template_file')

        wait_for_job

        # The upload should be successful and the staged file should not be in the dropzone
        # The newly uploaded file should show as a new file tab
        expect(dropzone).to have_no_css('span', text: 'template_file')
        expect(file_view).to have_css('span', text: 'template_file')
        expect(file_view).to have_css('span', count: 2)

        # Stage the same file again and attempt to upload
        # (Need to set to another file first before setting again to the first file)
        file_input.set(file_path2)
        wait_for_job

        file_input.set(file_path)
        wait_for_job

        # The upload should fail and the staged file should be gone from dropzone
        # There should still be only 2 files in the question
        expect(dropzone).to have_no_css('span', text: 'template_file')
        expect(file_view).to have_css('span', count: 2)
      end

      scenario 'I can delete existing programming files' do
        visit edit_course_assessment_submission_path(course, assessment, submission2)

        file_view = find('h6', text: 'Uploaded Files:').find(:xpath, '..')

        # There should be a single programming file in the submission
        expect(file_view).to have_css('span', count: 1)

        # Click on the delete button and confirm
        delete_button = file_view.find('svg')
        delete_button.click
        click_button('Delete')
        expect(page).to have_no_button('Delete')

        # It should indicate that there are no files uploaded
        # Original programming file in the question should have been deleted
        expect(file_view).to have_text('No files uploaded.')
        expect(file_view).to have_no_css('span', text: /file_/)
      end
    end
  end
end
