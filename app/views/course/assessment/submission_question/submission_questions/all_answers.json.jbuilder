# frozen_string_literal: true
json.allAnswers @all_answers do |answer|
  json.id answer.id
  json.createdAt answer.created_at&.iso8601
  json.currentAnswer answer.current_answer
  json.workflowState answer.workflow_state
end

json.canViewHistory @submission_question.question.history_viewable?

posts = @submission_question.discussion_topic.posts

json.comments posts do |post|
  json.partial! post, post: post if post.published?
end
