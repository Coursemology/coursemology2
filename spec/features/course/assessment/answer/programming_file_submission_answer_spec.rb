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

      # The answer's files are the rows of its file tree.
      def file_tree
        find('[role="tree"]')
      end

      def saved_filenames(submission)
        submission.answers.first.specific.reload.files.map(&:filename)
      end

      scenario 'I can upload programming files, and replace one after confirming' do
        visit edit_course_assessment_submission_path(course, assessment, submission)

        # The question's template file
        expect(file_tree).to have_css('[role="treeitem"]', count: 1)
        file_input = find('input[data-testid="file-tree-add-files"]', visible: false)

        file_input.set(file_path)
        expect(file_tree).to have_css('[role="treeitem"][aria-label="template_file"]')
        file_input.set(file_path2)
        expect(file_tree).to have_css('[role="treeitem"][aria-label="template_file_2"]')
        expect(file_tree).to have_css('[role="treeitem"]', count: 3)

        # A file with the name of one already uploaded asks first, with the sizes before and after
        file_input.set(file_path)
        within('[role="dialog"]') do
          expect(page).to have_text('template_file, 23 bytes → 23 bytes')
          click_button('Cancel')
        end
        expect(page).to have_no_css('[role="dialog"]')

        file_input.set(file_path)
        within('[role="dialog"]') { click_button('Replace') }
        expect(page).to have_no_css('[role="dialog"]')
        expect(page).to have_text('File uploaded successfully')

        expect(file_tree).to have_css('[role="treeitem"]', count: 3)
        expect(saved_filenames(submission)).to contain_exactly(
          submission.assessment.questions.first.specific.template_files.first.filename,
          'template_file', 'template_file_2'
        )
      end

      scenario 'Uploading keeps the bytes of every file, line endings included' do
        # Saved files go along with an upload, so their content is sent again too.
        saved = submission.answers.first.specific.files.first
        saved.update!(content: "a = 1\nb = 2\n")
        visit edit_course_assessment_submission_path(course, assessment, submission)

        find('input[data-testid="file-tree-add-files"]', visible: false).set(file_path)
        expect(file_tree).to have_css('[role="treeitem"][aria-label="template_file"]')

        uploaded = submission.answers.first.specific.files.reload.find_by(filename: 'template_file')
        expect(uploaded.content.b).to eq(File.binread(file_path))
        expect(saved.reload.content).to eq("a = 1\nb = 2\n")
      end

      scenario 'I can delete existing programming files' do
        visit edit_course_assessment_submission_path(course, assessment, submission2)

        # There should be a single programming file in the submission
        expect(file_tree).to have_css('[role="treeitem"]', count: 1)

        # Click on the row's delete button and confirm
        file_tree.find('[role="treeitem"]').find_button('Delete').click
        within('[role="dialog"]') { click_button('Delete') }
        expect(page).to have_no_css('[role="dialog"]')

        # The original programming file in the question should have been deleted
        expect(page).to have_text('No files yet.')
        expect(page).to have_no_css('[role="treeitem"]')
        expect(saved_filenames(submission2)).to be_empty
      end
    end
  end
end
