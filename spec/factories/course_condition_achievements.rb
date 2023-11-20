# frozen_string_literal: true
FactoryBot.define do
  factory :course_condition_achievement,
          class: Course::Condition::Achievement.name, aliases: [:achievement_condition] do
    course
    achievement
    conditional { association :course_achievement, course: course }
  end
end
