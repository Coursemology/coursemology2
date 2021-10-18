# frozen_string_literal: true
json.fields do
  json.questionId answer.question_id
  json.id answer.acting_as.id
  json.answer_text answer.answer_text
  json.partial! 'course/assessment/submission/answer/forum_post_response/posts/postpacks',
                selected_posts: answer.get_postpacks
end

last_attempt = last_attempt(answer)

json.explanation do
  json.correct last_attempt&.correct
  json.explanations []
end
