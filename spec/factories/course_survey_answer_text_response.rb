# frozen_string_literal: true
FactoryGirl.define do
  sequence(:course_survey_answer_text_response_answer) { |n| "Survey Text Response Answer #{n}" }
  factory :course_survey_answer_text_response, class: Course::Survey::Answer::TextResponse.name,
                                               parent: :course_survey_answer do
    text_response { generate(:course_survey_answer_text_response_answer) }
  end
end
