# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_question_text_response,
          class: Course::Assessment::Question::TextResponse,
          parent: :course_assessment_question do
    allow_attachment { false }
    hide_text { false }
    is_comprehension { false }

    solutions do
      [
        build(:course_assessment_question_text_response_solution, :exact_match, question: nil),
        build(:course_assessment_question_text_response_solution, :keyword, question: nil)
      ]
    end

    trait :multiple_keywords do
      solutions do
        [
          build(:course_assessment_question_text_response_solution, :exact_match, question: nil),
          build(:course_assessment_question_text_response_solution, :keyword,
                question: nil, solution: 'KeywordA'),
          build(:course_assessment_question_text_response_solution, :keyword,
                question: nil, solution: 'KeywordB')
        ]
      end
    end

    trait :allow_attachment do
      allow_attachment { true }
    end

    trait :file_upload_question do
      allow_attachment { true }
      hide_text { true }
    end

    trait :multiline_windows do
      solutions do
        [
          build(:course_assessment_question_text_response_solution, :multiline_windows, question: nil)
        ]
      end
    end

    trait :multiline_linux do
      solutions do
        [
          build(:course_assessment_question_text_response_solution, :multiline_linux, question: nil)
        ]
      end
    end

    trait :multiple_comprehension_groups do
      is_comprehension { true }
      groups do
        [
          build(:course_assessment_question_text_response_comprehension_group, question: nil),
          build(:course_assessment_question_text_response_comprehension_group, question: nil)
        ]
      end
    end

    trait :comprehension_question do
      is_comprehension { true }
      groups do
        [
          build(:course_assessment_question_text_response_comprehension_group, question: nil)
        ]
      end
    end
  end
end
