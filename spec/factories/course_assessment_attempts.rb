# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_attempt, class: Course::Assessment::Attempt, aliases: [:attempt] do
    assessment { create(:assessment, :with_mcq_question, course: create(:course)) }
  end
end
