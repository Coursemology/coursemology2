# frozen_string_literal: true
json.questionType answer.question.question_type

json.fields do
  json.questionId answer.question_id
  json.id answer.acting_as.id
  if answer.submission.workflow_state == 'attempting'
    json.answer_text answer.answer_text
  else
    json.answer_text format_ckeditor_rich_text(answer.answer_text)
  end
  json.partial! 'course/assessment/submission/answer/forum_post_response/posts/post_packs',
                selected_posts: answer.compute_post_packs
end

last_attempt = last_attempt(answer)

json.explanation do
  json.correct last_attempt&.correct
  json.explanations []
end
