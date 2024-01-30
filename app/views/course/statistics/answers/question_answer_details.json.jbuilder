# frozen_string_literal: true
question = @answer.question

json.question do
  json.id question.id
  json.title question.title
  json.maximumGrade question.maximum_grade
  json.description format_ckeditor_rich_text(question.description)
  json.type question.question_type

  json.partial! question, question: question.specific, can_grade: false, answer: @answer
end

specific_answer = @answer.specific
json.answer do
  json.grade @answer.grade
  json.partial! specific_answer, answer: specific_answer, can_grade: false
end
