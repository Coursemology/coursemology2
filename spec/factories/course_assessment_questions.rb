# frozen_string_literal: true
FactoryGirl.define do
  factory :course_assessment_question, class: Course::Assessment::Question do
    assessment
    sequence(:title) { |n| "The awesome question #{n}" }
    description 'Look at this awesome question'
    maximum_grade 2
    sequence(:weight)
  end
end
