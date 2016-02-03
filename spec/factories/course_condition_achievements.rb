# frozen_string_literal: true
FactoryGirl.define do
  factory :course_condition_achievement,
          class: Course::Condition::Achievement.name, aliases: [:achievement_condition] do
    course
    achievement
    association :conditional, factory: :course_achievement
  end
end
