# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessments: Submissions: Text Response Answers' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) do
      create(:course_assessment_assessment, :published_with_text_response_question, course: course)
    end
    before { login_as(user, scope: :user) }

    let(:submission) do
      create(:course_assessment_submission, *submission_traits, assessment: assessment,
                                                                creator: user)
    end
    let(:submission_traits) { nil }

    context 'As a Course Student' do
      let(:user) { create(:course_user, :approved, course: course).user }

      scenario 'I cannot update my submission after finalising' do
        visit edit_course_assessment_submission_path(course, assessment, submission)

        click_button I18n.t('course.assessment.submission.submissions.worksheet.finalise')

        within find(content_tag_selector(submission.answers.first)) do
          # We cannot use :fillable_field because the textarea has no labels.
          expect(all('textarea')).not_to be_empty
          all('textarea:not(.comment)').each do |input|
            expect(input.native.attr(:readonly)).to be_truthy
          end
        end
      end
    end

    context 'As Course Staff' do
      let(:user) { create(:course_teaching_assistant, :approved, course: course).user }
      let(:submission_traits) { :submitted }

      scenario 'I can view the grading scheme' do
        visit edit_course_assessment_submission_path(course, assessment, submission)
        click_link I18n.t('course.assessment.submission.submissions.worksheet.auto_grade')
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
