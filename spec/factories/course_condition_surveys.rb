# frozen_string_literal: true
FactoryBot.define do
  factory :course_condition_survey,
          class: 'Course::Condition::Survey', aliases: [:survey_condition] do
    course
    survey
    conditional { association :course_survey, course: course }
  end
end
