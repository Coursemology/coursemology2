# frozen_string_literal: true
FactoryGirl.define do
  sequence(:course_assessment_category_weight) { |n| n }
  sequence(:course_assessment_category_title) { |n| "Category #{n}" }
  factory :course_assessment_category, class: Course::Assessment::Category do
    course
    title { generate(:course_assessment_category_title) }
    weight { generate(:course_assessment_category_weight) }
  end
end
