# frozen_string_literal: true
json.id @thread.id
json.answerId @answer_id
json.threadId @thread.codaveri_thread_id
json.creatorId @thread.submission_creator_id
json.remainingMessages @thread.max_user_messages - @thread.messages.where(creator_id: current_user.id).count

json.messages @thread.messages.each do |message|
  json.content message.content
  json.creatorId message.creator_id
  json.isError message.is_error
  json.createdAt message.created_at&.iso8601
end
