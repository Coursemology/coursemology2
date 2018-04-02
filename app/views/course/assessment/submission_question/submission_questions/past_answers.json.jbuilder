# frozen_string_literal: true
json.answers answers do |answer|
  json.partial! answer, answer: answer
end
