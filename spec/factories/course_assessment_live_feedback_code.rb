# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_live_feedback_code, class: Course::Assessment::LiveFeedbackCode do
    feedback { association(:course_assessment_live_feedback) }
    filename { 'test_code.rb' }
    content { 'puts "Hello, World!"' }
  end
end
