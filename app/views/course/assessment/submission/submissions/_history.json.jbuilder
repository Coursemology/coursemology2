# frozen_string_literal: true
json.history do
  answer_history = submission.answer_history

  json.questions answer_history.map do |group|
    json.id group[:question_id]
    json.answerIds group[:answer_ids]
  end
end
