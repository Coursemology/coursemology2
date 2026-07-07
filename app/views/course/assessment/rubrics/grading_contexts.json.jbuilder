# frozen_string_literal: true
json.array! @grading_contexts do |grading_context|
  json.id grading_context.id
  json.identifier grading_context.identifier
  json.contextType grading_context.context_type
end
