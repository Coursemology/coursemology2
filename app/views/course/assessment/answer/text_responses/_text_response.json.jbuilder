# frozen_string_literal: true
json.fields do
  json.questionId answer.question_id
  json.id answer.acting_as.id
  question = answer.question.specific
  json.files nil # required for redux-form initial values
  json.answer_text answer.answer_text unless question.hide_text
end

json.attachments answer.attachments do |attachment|
  json.(attachment, :name, :id)
end

last_attempt = last_attempt(answer)

json.explanation do
  json.correct last_attempt&.correct
  if last_attempt&.auto_grading&.result
    json.explanations(last_attempt.auto_grading.result['messages'].map { |e| format_html(e) })
  else
    json.explanations []
  end
end
