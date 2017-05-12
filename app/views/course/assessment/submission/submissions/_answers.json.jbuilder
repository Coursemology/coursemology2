json.answers latest_attempts do |answer|
  json.partial! answer, answer: answer, can_grade: can_grade
end

json.explanations previous_attempts do |answer|
  json.partial! answer, answer: answer, can_grade: can_grade
end
