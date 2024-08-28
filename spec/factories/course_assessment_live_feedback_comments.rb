# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_live_feedback_comment, class: Course::Assessment::LiveFeedbackComment do
    code { association(:course_assessment_live_feedback_code) }
    line_number { 1 }
    comment { 'This is a test comment' }
  end
end
