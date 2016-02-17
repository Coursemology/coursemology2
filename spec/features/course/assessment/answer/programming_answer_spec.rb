# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessments: Submissions: Programming Answers' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) do
      create(:course_assessment_assessment, :with_programming_question, course: course)
    end
    before { login_as(user, scope: :user) }

    context 'As a Course Student' do
      let(:user) { create(:course_user, :approved, course: course).user }
      let(:submission) do
        submission = create(:course_assessment_submission, assessment: assessment, user: user)
        assessment.questions.attempt(submission)
        submission
      end

      scenario 'I can save my submission', js: true do
        submission
        visit edit_course_assessment_submission_path(course, assessment, submission)

        # Fill in every single successive item
        within find(content_tag_selector(submission.answers.first)) do
          all('div.files div.nested-fields').each_with_index do |file, i|
            within file do
              fill_in 'filename', with: "test #{i}.py"
            end
          end
        end

        click_button I18n.t('common.save')
        expect(current_path).to eq(
          edit_course_assessment_submission_path(course, assessment, submission))

        submission.answers.first.specific.files.reload.each_with_index do |_, i|
          expect(page).to have_field('filename', with: "test #{i}.py")
        end

        # Add a new file
        click_link(I18n.t('course.assessment.answer.programming.programming.add_file'))
        new_file_name = 'new_file.py'
        expected_files = [new_file_name] + submission.answers.first.specific.files.map(&:filename)
        within find(content_tag_selector(submission.answers.first)) do
          within all('div.files div.nested-fields').first do
            fill_in 'filename', with: new_file_name
          end
        end
        click_button I18n.t('common.save')

        expected_files.each do |file|
          expect(page).to have_field('filename', with: file)
        end

        # Delete files
        within find(content_tag_selector(submission.answers.first)) do
          all(:link, I18n.t('course.assessment.answer.programming.file_fields.delete')).
            each(&:click)
        end
        click_button I18n.t('common.save')

        expect(page).not_to have_field('filename')
      end
    end
  end
end
