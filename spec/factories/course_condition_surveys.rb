# frozen_string_literal: true
FactoryBot.define do
  factory :course_condition_survey,
          class: Course::Condition::Survey.name, aliases: [:survey_condition] do
    course
    survey
    association :conditional, factory: :course_survey
  end
end
