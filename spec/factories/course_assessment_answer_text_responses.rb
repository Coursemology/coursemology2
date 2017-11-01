# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_answer_text_response,
          class: Course::Assessment::Answer::TextResponse,
          parent: :course_assessment_answer do
    transient do
      question_traits nil
    end

    question do
      build(:course_assessment_question_text_response, *question_traits,
            assessment: assessment).question
    end

    answer_text '<p>xxx</p>'

    trait :exact_match do
      answer_text '<p>exact match</p>'
    end

    trait :keyword do
      answer_text '<p>my answer contains keyword match</p>'
    end

    trait :no_match do
      # use default text, nothing to do
    end
  end
end
