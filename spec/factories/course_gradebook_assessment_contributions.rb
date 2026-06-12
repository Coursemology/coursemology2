# frozen_string_literal: true
FactoryBot.define do
  factory :course_gradebook_assessment_contribution, class: Course::Gradebook::AssessmentContribution.name do
    assessment
    excluded { false }
  end
end
