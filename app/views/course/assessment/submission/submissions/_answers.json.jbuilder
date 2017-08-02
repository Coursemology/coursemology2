json.answers answers do |answer|
  json.partial! answer, answer: answer
end
