# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_question_rubric_based_response_category,
          class: Course::Assessment::Question::RubricBasedResponseCategory do
    association :question, factory: :course_assessment_question_rubric_based_response
    sequence(:name) { |n| "Rubric Category #{n}" }
    is_bonus_category { false }

    after(:build) do |category|
      category.criterions << build(:course_assessment_question_rubric_based_response_criterion,
                                   category: category,
                                   grade: 0,
                                   explanation: 'Grade 0 criterion')
    end

    trait :bonus do
      is_bonus_category { true }
    end
  end
end
