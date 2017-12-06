# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_question_text_response_point,
          class: Course::Assessment::Question::TextResponsePoint do
    group { build(:course_assessment_question_text_response_group) }
    maximum_point_grade 2
    sequence(:point_weight)

    solutions do
      [
        build(:course_assessment_question_text_response_solution, :exact_match, point: nil),
        build(:course_assessment_question_text_response_solution, :keyword, point: nil)
      ]
    end

    trait :multiple_solutions do
      solutions do
        [
          build(:course_assessment_question_text_response_solution, :exact_match, point: nil),
          build(:course_assessment_question_text_response_solution, :keyword,
                point: nil, solution: ['KeywordA']),
          build(:course_assessment_question_text_response_solution, :keyword,
                point: nil, solution: ['KeywordB'])
        ]
      end
    end

    trait :multiline_windows do
      solutions do
        [
          build(:course_assessment_question_text_response_solution, :multiline_windows, point: nil)
        ]
      end
    end

    trait :multiline_linux do
      solutions do
        [
          build(:course_assessment_question_text_response_solution, :multiline_linux, point: nil)
        ]
      end
    end

    trait :comprehension_point do
      solutions do
        [
          build(:course_assessment_question_text_response_solution, :compre_lifted_word, point: nil),
          build(:course_assessment_question_text_response_solution, :compre_keyword, point: nil)
        ]
      end
    end
  end
end
