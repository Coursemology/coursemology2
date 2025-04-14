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

json.categoryGrades answer.selections do |selection|
  criterion = selection.criterion

  json.id selection.id
  json.gradeId criterion&.id
  json.categoryId selection.category_id
  json.grade criterion ? criterion.grade : selection.grade
  json.explanation criterion ? nil : selection.explanation
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
