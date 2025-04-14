# frozen_string_literal: true
json.fields do
  json.questionId answer.question_id
  json.id answer.acting_as.id

  if answer.submission.workflow_state == 'attempting'
    json.answer_text answer.answer_text
  else
    json.answer_text format_ckeditor_rich_text(answer.answer_text)
  end
end

last_attempt = last_attempt(answer)

json.categoryScores answer.scores do |score|
  json.id score.id
  json.categoryId score.category_id
  json.score score.score
  json.explanation score.explanation
end

json.explanation do
  json.correct last_attempt&.correct
  json.explanations []
end

if answer.current_answer? && !last_attempt.current_answer?
  json.latestAnswer do
    json.partial! last_attempt, answer: last_attempt
  end
end
