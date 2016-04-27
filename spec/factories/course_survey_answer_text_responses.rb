# frozen_string_literal: true
FactoryGirl.define do
  factory :course_survey_answer_text_response, class: Course::Survey::Answer::TextResponse.name,
                                               parent: :course_survey_answer do
  end
end
