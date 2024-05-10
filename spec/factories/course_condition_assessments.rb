# frozen_string_literal: true
FactoryBot.define do
  factory :course_condition_assessment,
          class: 'Course::Condition::Assessment', aliases: [:assessment_condition] do
    course
    assessment
    conditional { association :assessment, course: course }
    minimum_grade_percentage { nil }

    trait :achievement_conditional do
      conditional { association :achievement, course: course }
    end

    trait :assessment_conditional do
    end
  end
end
