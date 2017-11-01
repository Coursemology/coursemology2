# frozen_string_literal: true
FactoryBot.define do
  sequence(:course_survey_answer_text) { |n| "Response to survey question #{n}" }
  factory :course_survey_answer, class: Course::Survey::Answer.name do
    response
    association :question, factory: :course_survey_question
    text_response do
      generate(:course_survey_answer_text) if question.text?
    end
  end
end
