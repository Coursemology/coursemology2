# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_question_multiple_response_option,
          class: Course::Assessment::Question::MultipleResponseOption do
    question { build(:course_assessment_question_multiple_response) }
    correct { false }
    option { 'Option' }
    sequence(:weight)

    trait :correct do
      correct { true }
      option { 'Correct' }
      explanation { 'Correct because this is correct' }
    end
    trait :wrong do
      correct { false }
      option { 'Wrong' }
      explanation { 'Wrong because this is wrong' }
    end
  end
end
