# frozen_string_literal: true
FactoryBot.define do
  factory :course_condition_assessment,
          class: Course::Condition::Assessment.name, aliases: [:assessment_condition] do
    course
    assessment
    association :conditional, factory: :assessment
    minimum_grade_percentage { nil }

    trait :achievement_conditional do
      association :conditional, factory: :achievement
    end

    trait :assessment_conditional do
    end
  end
end
