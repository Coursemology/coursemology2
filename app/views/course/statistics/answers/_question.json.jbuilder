# frozen_string_literal: true

json.question do
  json.id @question.id
  json.title @question.title
  json.maximumGrade @question.maximum_grade
  json.description format_ckeditor_rich_text(@question.description)
  json.type @question.question_type
  json.questionNumber @question_index + 1

  json.partial! @question, question: @question.specific, can_grade: false, answer: @all_answers.first
end
