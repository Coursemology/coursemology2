FactoryGirl.define do
  factory :course_condition_achievement, class: Course::Condition::Achievement.name do
    course
    achievement
    creator
    updater
  end
end
