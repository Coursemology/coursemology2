# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessments: Submissions: Multiple Response Answers' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:course_assessment_assessment, :with_mcq_question, course: course) }
    before { login_as(user, scope: :user) }

    let(:submission) do
      create(:course_assessment_submission, *submission_traits, assessment: assessment, user: user)
    end
    let(:submission_traits) { nil }
    let(:options) { assessment.questions.first.specific.options }
    let(:correct_option) { options.find(&:correct?).option }

    context 'As a Course Student' do
      let(:user) { create(:course_user, :approved, course: course).user }

      scenario 'I can save my submission' do
        visit edit_course_assessment_submission_path(course, assessment, submission)

        check correct_option

        click_button I18n.t('common.save')
        expect(current_path).to eq(\
          edit_course_assessment_submission_path(course, assessment, submission))

        expect(page).to have_checked_field(correct_option)
      end

      scenario 'I cannot update my submission after finalising' do
        visit edit_course_assessment_submission_path(course, assessment, submission)

        click_button I18n.t('course.assessment.submission.submissions.worksheet.finalise')

        within find(content_tag_selector(submission.answers.first)) do
          expect(all(:field, disabled: true)).not_to be_empty
          all(:field, disabled: true).each { |input| expect(input.disabled?).to be_truthy }
        end
      end
    end

    context 'As Course Staff' do
      let(:user) { create(:course_teaching_assistant, :approved, course: course).user }
      let(:submission_traits) { :submitted }

      scenario 'I can view the correct answer' do
        visit edit_course_assessment_submission_path(course, assessment, submission)

        within find(content_tag_selector(submission.answers.first)) do
          expect(all('.correct').length).to eq(options.to_a.count(&:correct?))
        end
      end

      scenario 'I can view the auto grading results' do
        visit edit_course_assessment_submission_path(course, assessment, submission)
        click_link I18n.t('course.assessment.submission.submissions.worksheet.auto_grade')
        wait_for_job

        expect(page).
          to have_selector('div', text: I18n.t('course.assessment.answer.explanation.wrong'))
      end
    end
  end
end
