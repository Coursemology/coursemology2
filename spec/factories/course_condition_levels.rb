FactoryGirl.define do
  factory :course_condition_level,
          class: Course::Condition::Level.name, aliases: [:level_condition] do
    course
    minimum_level 1
    creator
    updater
  end
end
