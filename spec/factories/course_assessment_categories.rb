FactoryGirl.define do
  sequence(:course_assessment_category_weight) { |n| n }
  factory :course_assessment_category, class: Course::Assessment::Category do
    course
    title 'Mission'
    weight { generate(:course_assessment_category_weight) }
  end
end
