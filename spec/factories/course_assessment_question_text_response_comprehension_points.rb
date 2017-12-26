# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_question_text_response_comprehension_point,
          class: Course::Assessment::Question::TextResponseComprehensionPoint do
    group { build(:course_assessment_question_text_response_comprehension_group) }
    point_grade 2

    solutions do
      [
        build(:course_assessment_question_text_response_comprehension_solution, :compre_lifted_word, point: nil),
        build(:course_assessment_question_text_response_comprehension_solution, :compre_keyword, point: nil)
      ]
    end
  end
end
