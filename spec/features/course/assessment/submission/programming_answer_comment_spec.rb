# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessment: Submissions: Programming Answers: Commenting' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, :with_programming_question, course: course) }
    let(:student) { create(:course_user, :approved, course: course).user }
    let(:submission) do
      create(:course_assessment_submission, assessment: assessment, user: student)
    end
    before { login_as(user, scope: :user) }

    context 'As a course student' do
      let(:user) { student }

      scenario 'I can annotate my answer after submitting', js: true do
        visit edit_course_assessment_submission_path(course, assessment, submission)

        code = <<-PYTHON
          def test:
            pass
        PYTHON
        find('.ace_text-input', visible: false).set(code) # because fill_in does not work with Ace.
        click_button I18n.t('course.assessment.submission.submissions.worksheet.finalise')
        wait_for_job

        within find(content_tag_selector(submission.answers.first)) do
          first_line = find('table.codehilite tr', match: :first)
          first_line.hover

          annotation_button = find('span.add-annotation', match: :first)
          annotation_button.click

          click_button 'Cancel'
          expect(page).not_to have_selector('.annotation-form')
        end
      end
    end
  end
end
