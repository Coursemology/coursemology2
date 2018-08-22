# frozen_string_literal: true
FactoryBot.define do
  base_time = Time.zone.now.to_i
  factory :course_assessment_question_programming_test_case,
          class: Course::Assessment::Question::ProgrammingTestCase do
    question { build(:course_assessment_question_programming) }
    sequence(:identifier) { |n| "test_id_#{base_time}_#{n}" }
    expression { '' }
    expected { '' }
    test_case_type { :public_test }

    trait :private do
      test_case_type { :private_test }
    end

    trait :evaluation do
      test_case_type { :evaluation_test }
    end
  end
end
