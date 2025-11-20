# frozen_string_literal: true
json.id @thread.id
json.answerId @answer_id
json.threadId @thread.codaveri_thread_id
json.creatorId @thread.submission_creator_id
json.sentMessages @thread.sent_user_messages(@thread.submission_creator_id)
json.maxMessages current_course.codaveri_max_get_help_user_messages if current_course.codaveri_get_help_usage_limited?

json.messages @thread.messages.each do |message|
  json.content message.content
  json.creatorId message.creator_id
  json.isError message.is_error
  json.createdAt message.created_at&.iso8601
end
