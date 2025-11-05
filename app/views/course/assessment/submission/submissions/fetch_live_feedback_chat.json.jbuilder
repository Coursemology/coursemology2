# frozen_string_literal: true
json.id @thread.id
json.answerId @answer_id
json.threadId @thread.codaveri_thread_id
json.creatorId @thread.submission_creator_id
json.remainingMessages @thread.remaining_user_messages(current_user)

json.messages @thread.messages.each do |message|
  json.content message.content
  json.creatorId message.creator_id
  json.isError message.is_error
  json.createdAt message.created_at&.iso8601
end
