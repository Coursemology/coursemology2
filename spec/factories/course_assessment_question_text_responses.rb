# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_question_text_response,
          class: Course::Assessment::Question::TextResponse,
          parent: :course_assessment_question do
    allow_attachment false
    hide_text false

    solutions do
      [
        build(:course_assessment_question_text_response_solution, :exact_match, question: nil),
        build(:course_assessment_question_text_response_solution, :keyword, question: nil)
      ]
    end

    trait :multiple do
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
      allow_attachment true
    end

    trait :file_upload_question do
      allow_attachment true
      hide_text true
    end
  end
end
