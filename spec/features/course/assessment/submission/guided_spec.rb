# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessment: Submissions: Guided' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, :guided, :with_all_question_types, course: course) }
    before { login_as(user, scope: :user) }

    let(:student) { create(:course_user, :approved, course: course).user }
    let(:submission) do
      create(:course_assessment_submission, assessment: assessment, user: student)
    end

    context 'As a Course Student' do
      let(:user) { student }

      scenario 'I can navigate between questions' do
        # Add a correct answer to the first question
        answer = assessment.questions.first.attempt(submission)
        answer.correct = true
        answer.save

        visit edit_course_assessment_submission_path(course, assessment, submission)

        1..assessment.questions.length do |step|
          path = edit_course_assessment_submission_path(course, assessment, submission,
                                                        step: step)
          expect(page).to have_link(step, href: path)
        end

        # TODO: Add more asserts once questions are displayed in guided assessment.
      end
    end
  end
end
