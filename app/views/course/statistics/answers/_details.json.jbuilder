# frozen_string_literal: true

json.partial! 'question'

json.allAnswers @all_answers do |answer|
  json.partial! 'answer', answer: answer, question: @question
  json.submittedAt answer.submitted_at&.iso8601
  json.currentAnswer answer.current_answer
  json.workflowState answer.workflow_state
end

posts = @submission_question.discussion_topic.posts

json.comments posts do |post|
  json.partial! post, post: post if post.published?
end
