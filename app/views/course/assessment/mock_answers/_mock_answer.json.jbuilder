# frozen_string_literal: true
json.id mock_answer.id
json.name mock_answer.name
# Raw name (may be blank); the frontend supplies the "(Mock Answer)" placeholder for blank titles.
json.title mock_answer.name
json.answerText mock_answer.answer_text
json.gradingContexts mock_answer.grading_contexts do |mock_context|
  # The join row's own id, so the client can round-trip it on update (update in place, no duplicate insert).
  json.id mock_context.id
  json.gradingContextId mock_context.grading_context_id
  json.content mock_context.content
end
