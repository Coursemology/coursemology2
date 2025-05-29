# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_question_rubric_based_response_criterion,
          class: Course::Assessment::Question::RubricBasedResponseCriterion do
    category { build(:course_assessment_question_rubric_based_response_category) }
    sequence(:explanation) { |n| "Criterion #{n} explanation" }
    grade { 0 }
  end
end
