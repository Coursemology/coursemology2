# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_answer_programming_auto_grading_test_result,
          class: Course::Assessment::Answer::ProgrammingAutoGradingTestResult do
    auto_grading { build(:course_assessment_answer_programming_auto_grading) }
    passed { true }

    trait :failed do
      passed { false }
      messages { { 'failure': 'simulated failure message' } }
    end

    trait :errored do
      passed { false }
      messages { { 'error': 'simulated error message' } }
    end

    trait :output do
      messages { { 'output': 'simulated test function output' } }
    end

    trait :failed_with_output do
      passed { false }
      messages do
        {
          'failure': 'simulated failure message',
          'output': 'simulated failed output'
        }
      end
    end
  end
end
