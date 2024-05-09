# frozen_string_literal: true
json.fields do
  json.questionId answer.question_id
  json.id answer.acting_as.id
  question = answer.question.specific
  json.answer_text answer.answer_text unless question.hide_text
end

json.attachments answer.attachments do |attachment|
  json.id attachment.id
  json.name attachment.name
  json.url attachment.url
end

last_attempt = last_attempt(answer)

json.explanation do
  json.correct last_attempt&.correct
  if last_attempt&.auto_grading&.result
    json.explanations(last_attempt.auto_grading.result['messages'].map { |e| format_ckeditor_rich_text(e) })
  else
    json.explanations []
  end
end

# Required in response of reload_answer and submit_answer to update past answers with the latest_attempt
# Removing this check will cause it to render the latestAnswer recursively
if answer.current_answer? && !last_attempt.current_answer?
  json.latestAnswer do
    json.partial! last_attempt, answer: last_attempt
  end
end
