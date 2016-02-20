# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessments: Submissions: Text Response Answers' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) do
      create(:course_assessment_assessment, :with_text_response_question, course: course)
    end
    before { login_as(user, scope: :user) }

    context 'As a Course Student' do
      let(:user) { create(:course_user, :approved, course: course).user }
      let(:submission) do
        submission = create(:course_assessment_submission, assessment: assessment, user: user)
        assessment.questions.attempt(submission)
        submission
      end

      scenario 'I cannot update my submission after finalising' do
        submission
        visit edit_course_assessment_submission_path(course, assessment, submission)

        click_button I18n.t('course.assessment.submissions.worksheet.finalise')

        within find(content_tag_selector(submission.answers.first)) do
          # We cannot use :fillable_field because the textarea has no labels.
          expect(all('textarea')).not_to be_empty
          all('textarea').each { |input| expect(input.native.attr(:readonly)).to be_truthy }
        end
      end
    end
  end
end
