require 'rails_helper'

RSpec.describe 'Course: Assessments: Attempt' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, course: course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Student' do
      let(:user) { create(:course_user, :approved, course: course).user }
      let(:submission) { create(:course_assessment_submission, assessment: assessment, user: user) }
      scenario 'I can attempt assessments' do
        assessment
        visit course_assessments_path(course)

        link = find_link(assessment.title, href: course_assessment_path(course, assessment))
        within link.find(:xpath, './../..') do
          find_button(I18n.t('course.assessment.assessments.assessment_row.attempt')).click
        end

        created_submission = assessment.submissions.last
        expect(current_path).to eq(edit_course_assessment_submission_path(
                                     course, assessment, created_submission))
      end

      scenario 'I can save submissions' do
        submission
        visit edit_course_assessment_submission_path(course, assessment, submission)

        click_button 'submit'
        expect(current_path).to eq(\
          edit_course_assessment_submission_path(course, assessment, submission))
      end
    end
  end
end
