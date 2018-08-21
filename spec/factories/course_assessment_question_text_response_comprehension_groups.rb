# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_question_text_response_comprehension_group,
          class: Course::Assessment::Question::TextResponseComprehensionGroup do
    question { build(:course_assessment_question_text_response) }
    maximum_group_grade { 2 }

    points do
      [
        build(:course_assessment_question_text_response_comprehension_point, group: nil)
      ]
    end

    trait :multiple_comprehension_points do
      points do
        [
          build(:course_assessment_question_text_response_comprehension_point, group: nil),
          build(:course_assessment_question_text_response_comprehension_point, group: nil)
        ]
      end
    end
  end
end
