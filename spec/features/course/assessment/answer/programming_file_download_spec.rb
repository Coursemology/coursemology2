# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessments: Submissions: Programming File', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, :published_with_programming_question, course: course) }
    let(:submission) do
      create(:submission, :published, assessment: assessment, creator: user)
    end
    let(:answer) { submission.answers.first }
    let(:file) { answer.actable.files.first }

    before { login_as(user, scope: :user) }

    context 'As a Course Student' do
      let(:user) { create(:course_student, course: course).user }

      context 'When the file is too long' do
        scenario 'I can download the programming answer file' do
          long_text = "\n" * (ApplicationHTMLFormattersHelper::MAX_CODE_LINES + 1)
          file.content = long_text
          file.save

          visit edit_course_assessment_submission_path(course, assessment, submission)

          download_path = download_course_assessment_submission_answer_programming_file_path(
            course, assessment, submission, answer, file
          )

          expect(page).to have_link('Download File', href: download_path)
        end
      end
    end
  end
end
