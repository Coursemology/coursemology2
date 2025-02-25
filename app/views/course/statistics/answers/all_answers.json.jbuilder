# frozen_string_literal: true
json.partial! 'all_questions'

json.allAnswers @all_answers do |answer|
  json.partial! 'answer', answer: answer, question: @question
end

posts = @submission_question.discussion_topic.posts

json.comments posts do |post|
  json.partial! post, post: post if post.published?
end
