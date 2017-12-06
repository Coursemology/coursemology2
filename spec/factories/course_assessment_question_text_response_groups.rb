# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_question_text_response_group,
          class: Course::Assessment::Question::TextResponseGroup do
    question { build(:course_assessment_question_text_response) }
    maximum_group_grade 2
    sequence(:group_weight)

    points do
      [
        build(:course_assessment_question_text_response_point, group: nil)
      ]
    end

    trait :multiple_points do
      points do
        [
          build(:course_assessment_question_text_response_point, group: nil),
          build(:course_assessment_question_text_response_point, group: nil)
        ]
      end
    end

    trait :multiple_solutions do
      points do
        [
          build(:course_assessment_question_text_response_point, :multiple_solutions, group: nil)
        ]
      end
    end

    trait :multiline_windows do
      points do
        [
          build(:course_assessment_question_text_response_point, :multiline_windows, group: nil)
        ]
      end
    end

    trait :multiline_linux do
      points do
        [
          build(:course_assessment_question_text_response_point, :multiline_linux, group: nil)
        ]
      end
    end

    trait :comprehension_group do
      points do
        [
          build(:course_assessment_question_text_response_point, :comprehension_point, group: nil)
        ]
      end
    end
  end
end
