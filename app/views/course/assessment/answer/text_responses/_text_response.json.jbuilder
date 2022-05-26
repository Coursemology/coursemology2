# frozen_string_literal: true
last_attempt = last_attempt(answer)

json.fields do
  json.questionId answer.question_id
  json.id answer.acting_as.id
  question = answer.question.specific
  json.files nil # required for react-hook-form initial values
  json.answer_text answer.answer_text unless question.hide_text
end

json.answerStatus do
  json.isLatestAnswer answer.specific.compare_answer(last_attempt.specific)
end

json.attachments answer.attachments do |attachment|
  json.(attachment, :name, :id)
end

json.explanation do
  json.correct last_attempt&.correct
  if last_attempt&.auto_grading&.result
    json.explanations(last_attempt.auto_grading.result['messages'].map { |e| format_ckeditor_rich_text(e) })
  else
    json.explanations []
  end
end
