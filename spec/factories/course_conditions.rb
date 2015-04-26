FactoryGirl.define do
  factory :course_conditions, class: Course::Condition.name do
    course
    creator
    updater
  end
end
