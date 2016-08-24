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
      let(:user) { create(:course_teaching_assistant, course: course).user }

      scenario 'I can access all submissions of an assessment' do
        assessment
        visit course_assessments_path(course)

        within find(content_tag_selector(assessment)) do
          click_link I18n.t('course.assessment.assessments.'\
                            'assessment_management_buttons.submissions')
        end

        expect(current_path).to eq(course_assessment_submissions_path(course, assessment))

        # Access submissions from the show assessment page
        visit course_assessment_path(course, assessment)
        click_link I18n.t('course.assessment.assessments.'\
                          'assessment_management_buttons.submissions')
        expect(current_path).to eq(course_assessment_submissions_path(course, assessment))
      end

      scenario 'I can view assessment conditions in the assessment page' do
        # Assessment Conditional
        other_assessment = create(:assessment, course: course)
        condition_with_assessment_conditional =
          create(:assessment_condition, course: course, assessment: assessment,
                                        conditional: other_assessment)

        # Achievement Conditional
        achievement = create(:achievement, course: course)
        condition_with_achievement_conditional =
          create(:assessment_condition, course: course, assessment: assessment,
                                        conditional: achievement)

        visit course_assessment_path(course, assessment)

        expect(page).to have_content_tag_for(condition_with_assessment_conditional)
        expect(page).to have_content_tag_for(condition_with_achievement_conditional)
      end

      scenario 'I attempt the assessment from the show assessment page' do
        visit course_assessment_path(course, assessment)

        expect(page).to have_link(
          I18n.t('course.assessment.assessments.assessment_management_buttons.attempt'),
          href: course_assessment_submissions_path(course, assessment)
        )
      end
    end
  end
end
