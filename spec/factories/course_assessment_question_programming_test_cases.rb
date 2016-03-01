# frozen_string_literal: true
FactoryGirl.define do
  base_time = Time.zone.now.to_i
  factory :course_assessment_question_programming_test_case,
          class: Course::Assessment::Question::ProgrammingTestCase do
    question { build(:course_assessment_question_programming) }
    sequence(:identifier) { |n| "test_id_#{base_time}_#{n}" }
    description ''
    public true

    trait :private do
      public false
    end
  end
end
