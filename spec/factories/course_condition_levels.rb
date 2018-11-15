# frozen_string_literal: true
FactoryBot.define do
  factory :course_condition_level,
          class: Course::Condition::Level.name, aliases: [:level_condition] do
    course
    minimum_level { 1 }
    association :conditional, factory: :course_achievement
  end
end
