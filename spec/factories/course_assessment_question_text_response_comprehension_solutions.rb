# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_question_text_response_comprehension_solution,
          class: Course::Assessment::Question::TextResponseComprehensionSolution do
    point { build(:course_assessment_question_text_response_comprehension_point) }
    solution ['key']
    solution_lemma ['key']
    explanation 'explanation'
    solution_type :compre_keyword

    trait :compre_lifted_word do
      solution_type :compre_lifted_word
      solution ['lifted']
      solution_lemma ['lift']
    end

    trait :compre_keyword do
      solution_type :compre_keyword
      solution ['key']
      solution_lemma ['key']
    end
  end
end
