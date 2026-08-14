# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_answer_rubric_based_response,
          class: Course::Assessment::Answer::RubricBasedResponse,
          parent: :course_assessment_answer do
    transient do
      question_traits { nil }
    end

    question do
      build(:course_assessment_question_rubric_based_response, *question_traits,
            assessment: assessment).question
    end
    answer_text { 'This is a sample response to the rubric question.' }
  end
end
