# frozen_string_literal: true
FactoryBot.define do
  factory :learning_map, class: Course::LearningMap do
    course
  end
end
