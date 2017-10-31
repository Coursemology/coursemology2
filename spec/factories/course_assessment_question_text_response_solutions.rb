# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_question_text_response_solution,
          class: Course::Assessment::Question::TextResponseSolution do
    question { build(:course_assessment_question_text_response) }
    solution 'sample exact match'
    explanation 'explanation'
    solution_type :exact_match

    trait :keyword do
      solution_type :keyword
      solution 'Keyword'
      grade 1
    end

    trait :exact_match do
      solution_type :exact_match
      solution 'Exact Match'
      grade 2
    end
  end
end
