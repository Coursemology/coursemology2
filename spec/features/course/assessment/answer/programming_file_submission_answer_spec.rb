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

      scenario 'I can only upload new programming files' do
        visit edit_course_assessment_submission_path(course, assessment, submission)

        # The question's template file
        expect(file_tree).to have_css('[role="treeitem"]', count: 1)
        file_input = find('input[data-testid="file-tree-add-files"]', visible: false)

        file_input.set(file_path)
        expect(file_tree).to have_css('[role="treeitem"][aria-label="template_file"]')
        expect(file_tree).to have_css('[role="treeitem"]', count: 2)

        file_input.set(file_path2)
        expect(file_tree).to have_css('[role="treeitem"][aria-label="template_file_2"]')
        expect(file_tree).to have_css('[role="treeitem"]', count: 3)

        # A file with the name of one already uploaded is turned away, and nothing more is saved
        file_input.set(file_path)
        expect(page).to have_text('A file or folder with this name already exists here.')
        expect(file_tree).to have_css('[role="treeitem"]', count: 3)
        expect(saved_filenames(submission)).to contain_exactly(
          submission.assessment.questions.first.specific.template_files.first.filename,
          'template_file', 'template_file_2'
        )
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
