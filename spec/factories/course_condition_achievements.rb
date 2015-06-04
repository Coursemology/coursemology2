FactoryGirl.define do
  factory :course_condition_achievement,
          class: Course::Condition::Achievement.name, aliases: [:achievement_condition] do
    course
    achievement
    creator
    updater
  end
end
