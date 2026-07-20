# frozen_string_literal: true
json.array! @mock_answers.includes(:grading_contexts) do |mock_answer|
  json.partial! 'mock_answer', mock_answer: mock_answer
end
