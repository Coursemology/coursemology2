# frozen_string_literal: true
FactoryBot.define do
  factory :course_condition_level,
          class: 'Course::Condition::Level', aliases: [:level_condition] do
    course
    minimum_level { 1 }
    conditional { association :course_achievement, course: course }
  end
end
