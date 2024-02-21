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

json.answer do
  json.partial! 'answer', answer: @answer, question: question
end

json.allAnswers @all_answers do |answer|
  json.partial! 'answer', answer: answer, question: question
  json.createdAt answer.created_at&.iso8601
  json.currentAnswer answer.current_answer
end

json.submissionQuestionId @submission_question.id
