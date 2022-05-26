# frozen_string_literal: true
last_attempt = last_attempt(answer)

json.fields do
  json.questionId answer.question_id
  json.id answer.acting_as.id
  json.option_ids answer.options.map(&:id)
end

json.answerStatus do
  json.isLatestAnswer answer.specific.compare_answer(last_attempt.specific)
end

json.explanation do
  if last_attempt&.auto_grading&.result
    json.correct last_attempt.correct
    json.explanations(last_attempt.auto_grading.result['messages'].map { |e| format_ckeditor_rich_text(e) })
  end
end
