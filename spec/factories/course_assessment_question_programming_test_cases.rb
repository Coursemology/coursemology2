# frozen_string_literal: true
FactoryBot.define do
  # Unique per process — see the note in user_emails.rb.
  run_id = "#{Time.zone.now.to_i}-#{SecureRandom.hex(3)}"
  factory :course_assessment_question_programming_test_case,
          class: Course::Assessment::Question::ProgrammingTestCase do
    question { build(:course_assessment_question_programming) }
    sequence(:identifier) { |n| "test_id_#{run_id}_#{n}" }
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
