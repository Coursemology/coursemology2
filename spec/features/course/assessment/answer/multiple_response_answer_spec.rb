# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessments: Submissions: Multiple Response Answers' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:course_assessment_assessment, :with_mcq_question, course: course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Student' do
      let(:user) { create(:course_user, :approved, course: course).user }
      let(:submission) do
        submission = create(:course_assessment_submission, assessment: assessment, user: user)
        assessment.questions.attempt(submission)
        submission
      end
      let(:correct_option) { assessment.questions.first.specific.options.find(&:correct?).option }

      scenario 'I can save my submission' do
        submission
        visit edit_course_assessment_submission_path(course, assessment, submission)

        check correct_option

        click_button I18n.t('common.save')
        expect(current_path).to eq(\
          edit_course_assessment_submission_path(course, assessment, submission))

        expect(page).to have_checked_field(correct_option)
      end
    end
  end
end
