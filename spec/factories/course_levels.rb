FactoryGirl.define do
  factory :course_level, class: Course::Level.name do
    course
    sequence(:experience_points_threshold)
  end
end
