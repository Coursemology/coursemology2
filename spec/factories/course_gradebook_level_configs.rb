# frozen_string_literal: true
FactoryBot.define do
  factory :course_gradebook_level_config, class: Course::Gradebook::LevelConfig.name do
    course
    enabled { false }
    formula { '' }
    weight { 0 }
    show { false }
    clamp { true }
  end
end
