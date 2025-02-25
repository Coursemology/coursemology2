# frozen_string_literal: true
json.answers answers do |answer|
  json.partial! 'course/statistics/answers/answer', answer: answer, question: question
end
