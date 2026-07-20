# frozen_string_literal: true
json.array! @grading_contexts do |grading_context|
  json.partial! 'grading_context', grading_context: grading_context
end
