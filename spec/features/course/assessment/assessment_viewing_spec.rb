# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessments: Viewing' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) do
      create(:course_assessment_assessment, :with_all_question_types, course: course)
    end
    before { login_as(user, scope: :user) }

    context 'As a Course Staff' do
      let(:user) { create(:course_teaching_assistant, :approved, course: course).user }

      scenario 'I can access all submissions of an assessment' do
        assessment
        visit course_assessments_path(course)

        within find(content_tag_selector(assessment)) do
          click_link I18n.t('course.assessment.assessments.assessment.submissions')
        end

        expect(current_path).to eq(course_assessment_submissions_path(course, assessment))
      end
    end
  end
end
