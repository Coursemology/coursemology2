# frozen_string_literal: true
FactoryGirl.define do
  factory :course_survey_question_text_response, class: Course::Survey::Question::TextResponse.name,
                                                 parent: :course_survey_question do
  end
end
