FactoryGirl.define do
  factory :course_conditions, class: Course::Condition.name do
    course
  end
end
