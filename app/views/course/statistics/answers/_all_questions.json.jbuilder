# frozen_string_literal: true

json.allQuestions @all_actable_questions do |question|
  json.id question.id
  json.title question.title
  json.maximumGrade question.maximum_grade
  json.description format_ckeditor_rich_text(question.description)
  json.type question.question_type

  json.partial! question, question: question, can_grade: false, answer: @all_answers.first
end
