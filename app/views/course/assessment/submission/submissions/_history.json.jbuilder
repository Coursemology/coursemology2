json.history do
  answer_history = submission.answer_history(past_answer)

  json.questions answer_history.map do |group|
    json.id group[:question_id]
    json.answerIds group[:answer_ids]
    json.pastAnswers group[:past_answers] do |answer|
      json.partial! answer, answer: answer
    end
    json.numMoreRecentAnswers group[:num_more_recent_answers]
  end
end
