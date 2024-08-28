# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_live_feedback_code, class: Course::Assessment::LiveFeedbackCode do
    feedback { association(:course_assessment_live_feedback) }
    filename { 'test_code.rb' }
    content { 'puts "Hello, World!"' }

    transient do
      with_comment { false }
    end

    after(:create) do |live_feedback_code, evaluator|
      create(:course_assessment_live_feedback_comment, code: live_feedback_code) if evaluator.with_comment
    end
  end
end
