# frozen_string_literal: true
question = @answer.question

json.question do
  json.id question.id
  json.title question.title
  json.maximumGrade question.maximum_grade
  json.description format_ckeditor_rich_text(question.description)
  json.type question.question_type

  json.partial! question, question: question.specific, can_grade: false, answer: @answer
end

json.answer do
  json.partial! 'answer', answer: @answer, question: question
end

json.allAnswers @all_answers do |answer|
  json.partial! 'answer', answer: answer, question: question
  json.createdAt answer.created_at&.iso8601
  json.currentAnswer answer.current_answer
  json.workflowState answer.workflow_state
end

posts = @submission_question.discussion_topic.posts

json.comments posts do |post|
  json.partial! post, post: post if post.published?
end

json.submissionId @submission.id
json.submissionQuestionId @submission_question.id
