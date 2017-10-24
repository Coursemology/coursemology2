# frozen_string_literal: true
FactoryGirl.define do
  factory :course_assessment_answer_text_input,
          class: Course::Assessment::Answer::TextInput,
          parent: :course_assessment_answer do
    transient do
      question_traits nil
    end

    question do
      build(:course_assessment_question_text_input, *question_traits,
            assessment: assessment).question
    end

    answer_text '<p>xxx</p>'

    trait :exact_match do
      answer_text '<p>exact match</p>'
    end

    trait :keyword do
      answer_text '<p>my answer contains keyword match</p>'
    end

    trait :compre_lifted_word do
      answer_text '<p>my answer contains lifting from text passage</p>'
    end

    trait :compre_keyword do
      answer_text '<p>my answer contains keyword</p>'
    end

    trait :no_match do
      # use default text, nothing to do
    end
  end
end
