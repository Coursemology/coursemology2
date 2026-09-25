# frozen_string_literal: true
# The latest AI feedback comment on this answer's question, so the client can show it as soon as grading
# finishes rather than on the next full page load. Which state that is depends on the course's feedback
# workflow: a draft for staff to review, or already published to the student. Visibility follows the
# submission's own comment rules (see _topics.json.jbuilder): staff see every state, students only what has
# been published.
posts = answer.submission.submission_questions.find_by(question_id: answer.question_id)&.discussion_topic&.posts
ai_generated_comment = posts&.select do |post|
  post.is_ai_generated && (can_grade || post.published?)
end&.last
if ai_generated_comment
  json.aiGeneratedComment do
    json.partial! ai_generated_comment
  end
end
