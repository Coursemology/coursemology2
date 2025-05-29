# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_answer_rubric_based_response_selection,
          class: Course::Assessment::Answer::RubricBasedResponseSelection do
    association :answer, factory: :course_assessment_answer_rubric_based_response

    transient do
      question { answer.question.specific }
    end

    category do
      question.categories.first
    end

    criterion { nil }
    grade { nil }
    explanation { nil }
  end
end
