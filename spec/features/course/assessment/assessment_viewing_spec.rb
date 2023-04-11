# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessments: Viewing', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, :published_with_all_question_types, course: course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Staff' do
      let(:user) { create(:course_teaching_assistant, course: course).user }

      scenario 'I can access all submissions of an assessment' do
        assessment
        visit course_assessments_path(course)

        submissions_button = find_link('Submissions', visible: false)
        hover_then_click submissions_button

        expect(current_path).to eq(course_assessment_submissions_path(course, assessment))

        # Access submissions from the show assessment page
        visit course_assessment_path(course, assessment)
        click_link 'Submissions'
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

        expect(page).to have_content(condition_with_assessment_conditional.title)
        expect(page).to have_content(condition_with_achievement_conditional.title)
      end

      scenario 'I attempt the assessment from the show assessment page' do
        # Create a random submission which does not belong to the user.
        # The button should still be 'Attempt' with the random submission.
        student_user = create(:course_student, course: course).user
        create(:submission, assessment: assessment, creator: student_user)
        visit course_assessment_path(course, assessment)

        expect(page).to have_link(
          'Attempt',
          href: course_assessment_path(course, assessment)
        )
      end
    end

    context 'As a Course Student' do
      let(:user) { create(:course_student, course: course).user }

      scenario 'I can view assessment dependencies in the assessment page' do
        # Create Assessment Condition
        other_assessment = create(:assessment, course: course)
        assessment_condition =
          create(:assessment_condition, course: course, assessment: other_assessment,
                                        conditional: assessment)

        # Create Achievement Condition
        achievement = create(:achievement, course: course)
        achievement_condition =
          create(:achievement_condition, course: course, achievement: achievement,
                                         conditional: assessment)

        visit course_assessment_path(course, assessment)

        expect(page).to have_content(assessment_condition.title)
        expect(page).to have_content(achievement_condition.title)
      end
    end
  end
end
