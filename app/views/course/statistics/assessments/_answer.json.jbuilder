# frozen_string_literal: true
json.grader do
  json.id grader&.id || 0
  json.name grader&.name || 'System'
end

json.answers answers.each do |answer|
  json.lastAttemptAnswerId answer.last_attempt_answer_id
  json.grade answer.grade
  json.maximumGrade @question_maximum_grade_hash[answer.question_id]
  json.questionType @question_type_hash[answer.question_id]
end
