# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_live_feedback_message, class: Course::Assessment::LiveFeedback::Message,
                                                    aliases: [:live_feedback_message] do
    thread { association(:live_feedback_thread) }
    is_error { false }
    content { 'this is the sample message' }

    creator_id { thread.submission_creator_id }
    created_at { Time.zone.now }
  end
end
