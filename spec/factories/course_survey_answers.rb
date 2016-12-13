# frozen_string_literal: true
FactoryGirl.define do
  factory :course_survey_answer, class: Course::Survey::Answer.name do
    response
    association :question, factory: :course_survey_question
  end
end
