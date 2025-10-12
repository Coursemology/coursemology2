# frozen_string_literal: true
json.array! @mock_answers do |mock_answer|
  json.id mock_answer.id
  json.answerText mock_answer.answer_text
  json.title '(Mock Answer)'
end
