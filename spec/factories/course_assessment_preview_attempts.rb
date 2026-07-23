# frozen_string_literal: true

FactoryBot.define do
  factory :course_assessment_preview_attempt, class: Course::Assessment::PreviewAttempt,
                                              aliases: [:preview_attempt] do
    transient do
      course { create(:course) }
    end

    assessment { create(:assessment, :with_mcq_question, course: course) }
    creator { create(:user) }
    updater { creator }
    workflow_state { 'attempting' }
  end
end
