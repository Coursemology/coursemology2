# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessments: Submissions: Text Response Answers' do
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

      scenario 'I cannot update my submission after finalising' do
        visit edit_course_assessment_submission_path(course, assessment, submission)

        click_button I18n.t('course.assessment.submission.submissions.buttons.finalise')

        within find(content_tag_selector(submission.answers.first)) do
          # We cannot use :fillable_field because the textarea has no labels.
          expect(all('textarea')).not_to be_empty
          all('textarea:not(.comment)').each do |input|
            expect(input.native.attr(:readonly)).to be_truthy
          end
        end
      end

      scenario 'I upload an attachment to the answer' do
        visit edit_course_assessment_submission_path(course, assessment, submission)

        answer = submission.answers.last
        attach_file "submission_answers_attributes_#{answer.id}_actable_attributes_files",
                    File.join(Rails.root, '/spec/fixtures/files/text.txt')

        click_button I18n.t('course.assessment.submission.submissions.buttons.save')

        expect(answer.specific.attachments).not_to be_empty
      end

      scenario 'I cannot see the text box for a file upload question' do
        assessment = create(:assessment, :published_with_file_upload_question, course: course)
        submission = create(:submission, assessment: assessment, creator: user)

        visit edit_course_assessment_submission_path(course, assessment, submission)

        file_upload_answer = submission.answers.first
        within find(content_tag_selector(file_upload_answer)) do
          expect(page).not_to have_selector('textarea:not(.comment)')
        end
      end
    end

    context 'As Course Staff' do
      let(:user) { create(:course_teaching_assistant, course: course).user }
      let(:submission_traits) { :submitted }

      scenario 'I can view the grading scheme' do
        visit edit_course_assessment_submission_path(course, assessment, submission)
        click_link I18n.t('course.assessment.submission.submissions.buttons.evaluate_answers')
        wait_for_job

        expect(page).
          to have_selector('div', text: I18n.t('course.assessment.answer.explanation.wrong'))

        within find(content_tag_selector(submission.answers.first)) do
          assessment.questions.first.actable.solutions.each do |solution|
            expect(page).to have_content_tag_for(solution)
          end
        end
      end
    end
  end
end
