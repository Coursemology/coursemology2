# frozen_string_literal: true
json.fields do
  json.questionId answer.question_id
  json.id answer.acting_as.id
  json.answer_text format_ckeditor_rich_text(answer.answer_text)
  json.partial! 'course/assessment/submission/answer/forum_post_response/posts/post_packs',
                selected_posts: answer.compute_post_packs
end

last_attempt = last_attempt(answer)

json.explanation do
  json.correct last_attempt&.correct
  json.explanations []
end
