# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_question_text_response,
          class: Course::Assessment::Question::TextResponse,
          parent: :course_assessment_question do
    allow_attachment false
    hide_text false
    is_comprehension false

    groups do
      [
        build(:course_assessment_question_text_response_group, question: nil)
      ]
    end

    trait :multiple_groups do
      groups do
        [
          build(:course_assessment_question_text_response_group, question: nil),
          build(:course_assessment_question_text_response_group, question: nil)
        ]
      end
    end

    trait :multiple_solutions do
      groups do
        [
          build(:course_assessment_question_text_response_group, :multiple_solutions, question: nil)
        ]
      end
    end

    trait :allow_attachment do
      allow_attachment true
    end

    trait :file_upload_question do
      allow_attachment true
      hide_text true
    end

    trait :multiline_windows do
      groups do
        [
          build(:course_assessment_question_text_response_group, :multiline_windows, question: nil)
        ]
      end
    end

    trait :multiline_linux do
      groups do
        [
          build(:course_assessment_question_text_response_group, :multiline_linux, question: nil)
        ]
      end
    end

    trait :comprehension_question do
      groups do
        [
          build(:course_assessment_question_text_response_group, :comprehension_group, question: nil)
        ]
      end
    end
  end
end
