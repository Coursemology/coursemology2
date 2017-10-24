# frozen_string_literal: true
FactoryGirl.define do
  factory :course_assessment_question_text_input_group,
          class: Course::Assessment::Question::TextInputGroup do
    question { build(:course_assessment_question_text_input) }
    maximum_group_grade 2

    points do
      [
        build(:course_assessment_question_text_input_point, group: nil)
      ]
    end

    trait :comprehension_group do
      points do
        [
          build(:course_assessment_question_text_input_point, :comprehension_point, group: nil)
        ]
      end
    end
  end
end
