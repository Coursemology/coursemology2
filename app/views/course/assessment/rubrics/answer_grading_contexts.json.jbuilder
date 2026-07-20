# frozen_string_literal: true
json.array! @answer_grading_contexts do |entry|
  json.partial! 'grading_context', grading_context: entry[:context]
  json.content entry[:content]
end
