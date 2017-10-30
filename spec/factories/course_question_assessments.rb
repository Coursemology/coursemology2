# frozen_string_literal: true
FactoryGirl.define do
  factory :course_question_assessment, class: Course::QuestionAssessment do
    question { build(:course_assessment_question_text_response).acting_as }
    assessment
    sequence(:weight)
  end
end
