# frozen_string_literal: true
json.attemptStatus answers.each do |answer|
  json.isAutograded @question_auto_gradable_status_hash[answer.question_id]
  json.attemptCount answer.attempt_count
  json.correct answer.correct
end
