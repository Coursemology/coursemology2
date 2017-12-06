# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_question_text_response_solution,
          class: Course::Assessment::Question::TextResponseSolution do
    point { build(:course_assessment_question_text_response_point) }
    solution ['sample exact match']
    explanation 'explanation'
    solution_type :exact_match
    sequence(:weight)

    trait :keyword do
      solution_type :keyword
      solution ['Keyword']
      grade 1
    end

    trait :exact_match do
      solution_type :exact_match
      solution ['Exact Match']
      grade 2
    end

    trait :multiline_windows do
      solution_type :exact_match
      solution ["hello world\r\nsecond line"]
      grade 2
    end

    trait :multiline_linux do
      solution_type :exact_match
      solution ["hello world\nsecond line"]
      grade 2
    end

    trait :compre_lifted_word do
      solution_type :compre_lifted_word
      solution ['lifted']
      solution_lemma ['lift']
      grade 0.0
    end

    trait :compre_keyword do
      solution_type :compre_keyword
      solution ['keyword']
      solution_lemma ['keyword']
      grade 0.5
    end
  end
end
