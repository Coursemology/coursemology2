json.answers answers do |answer|
  json.partial! answer, answer: answer, can_grade: can_grade
end
