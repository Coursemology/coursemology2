# frozen_string_literal: true
json.attemptStatus answers.each do |answer|
  _, _, auto_gradable = @question_hash[answer.question_id]

  json.lastAttemptAnswerId answer.last_attempt_answer_id
  json.isAutograded auto_gradable
  json.attemptCount answer.attempt_count
  json.correct answer.correct
end
