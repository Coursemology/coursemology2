# frozen_string_literal: true
json.grader do
  json.id grader&.id || 0
  json.name grader&.name || 'System'
end

json.answers answers.each do |answer|
  json.id answer.id
  json.grade answer.grade
  json.maximumGrade @question_maximum_grade_hash[answer.question_id]
end
