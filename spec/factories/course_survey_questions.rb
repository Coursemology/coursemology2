# frozen_string_literal: true
FactoryGirl.define do
  sequence(:course_survey_question_name) { |n| "Survey Question #{n}" }
  factory :course_survey_question, class: Course::Survey::Question.name do
    survey
    description { generate(:course_survey_question_name) }
  end
end
