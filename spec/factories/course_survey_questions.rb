# frozen_string_literal: true
FactoryGirl.define do
  sequence(:course_survey_question_name) { |n| "Survey Question #{n}" }
  factory :course_survey_question, class: Course::Survey::Question.name do
    transient do
      last_weight { section.questions.maximum(:weight) }
    end

    section
    weight { last_weight ? last_weight + 1 : 0 }
    description { generate(:course_survey_question_name) }
  end
end
