FactoryGirl.define do
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

    answer_text 'xxx'

    trait :exact_match do
      answer_text 'exact match'
    end

    trait :keyword do
      answer_text 'my answer contains keyword match'
    end

    trait :no_match do
      # use default text, nothing to do
    end
  end
end
