# frozen_string_literal: true
json.liveFeedbackHistory do
  json.array! @live_feedbacks.map do |live_feedback|
    json.id live_feedback.id
    json.createdAt live_feedback.created_at&.iso8601
    json.partial! 'live_feedback_history_details', live_feedback_id: live_feedback.id
  end
end

json.question do
  json.id @question.id
  json.title @question.title
  json.description format_ckeditor_rich_text(@question.description)
end
