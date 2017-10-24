# frozen_string_literal: true
FactoryGirl.define do
  factory :course_assessment_question_text_input_point,
          class: Course::Assessment::Question::TextInputPoint do
    group { build(:course_assessment_question_text_input_group) }
    maximum_point_grade 2

    solutions do
      [
        build(:course_assessment_question_text_input_solution, :exact_match, point: nil),
        build(:course_assessment_question_text_input_solution, :keyword, point: nil)
      ]
    end

    trait :comprehension_point do
      group nil
      solutions do
        [
          build(:course_assessment_question_text_input_solution, :compre_lifted_word, point: nil),
          build(:course_assessment_question_text_input_solution, :compre_keyword, point: nil)
        ]
      end
    end
  end
end
