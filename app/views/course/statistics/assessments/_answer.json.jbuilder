# frozen_string_literal: true
json.grader do
  json.id grader&.id || 0
  json.name grader&.name || 'System'
end

json.answers answers.each do |answer|
  maximum_grade, question_type, = @question_hash[answer.question_id]

  json.lastAttemptAnswerId answer.last_attempt_answer_id
  json.grade answer.grade
  json.maximumGrade maximum_grade
  json.questionType question_type
end
