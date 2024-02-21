# frozen_string_literal: true
specific_answer = answer.specific

json.id answer.id
json.grade answer.grade
json.questionType question.question_type
json.partial! specific_answer, answer: specific_answer, can_grade: false
