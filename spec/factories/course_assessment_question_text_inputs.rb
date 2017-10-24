# frozen_string_literal: true
FactoryGirl.define do
  factory :course_assessment_question_text_input,
          class: Course::Assessment::Question::TextInput,
          parent: :course_assessment_question do
    allow_attachment false
    hide_text false
    is_comprehension false

    groups do
      [
        build(:course_assessment_question_text_input_group, question: nil)
      ]
    end

    trait :allow_attachment do
      allow_attachment true
    end

    trait :file_upload_question do
      allow_attachment true
      hide_text true
    end

    trait :comprehension_question do
      is_comprehension true
      groups do
        [
          build(:course_assessment_question_text_input_group, :comprehension_group, question: nil)
        ]
      end
    end
  end
end
