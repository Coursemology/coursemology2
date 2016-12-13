# frozen_string_literal: true
FactoryGirl.define do
  sequence(:course_survey_name) { |n| "Survey #{n}" }
  factory :course_survey, class: Course::Survey.name,
                          aliases: [:survey], parent: :course_lesson_plan_item do
    title { generate(:course_survey_name) }
  end
end
