# frozen_string_literal: true
# Grading-context editor data, shared by the rubric-graded question forms (RBR + forum post). Emits the
# question's existing contexts, the provider kinds this type can use, and the sibling questions selectable as
# sources. Expects +question+ (the actable question) and +assessment+ locals.

# The provider kinds selectable on this question's edit page (e.g. sibling + forum thread for forum posts).
json.availableGradingContextTypes question.available_grading_context_types

json.gradingContexts question.acting_as.grading_contexts do |context|
  json.id context.id
  json.contextType context.context_type
  # Null for intrinsic providers (forum thread); a sibling question id for sibling-answer contexts.
  json.sourceId context.source_id
  json.identifier context.identifier
end

# Questions in this assessment whose answers can serve as sibling-answer context (this question excluded).
this_question_id = question.acting_as.id
sibling_questions = assessment.questions.reject do |sibling|
  sibling.id == this_question_id || !sibling.provides_grading_context?
end
json.contextSourceOptions sibling_questions do |sibling|
  json.id sibling.id
  json.title sibling.title
  json.questionType sibling.question_type
end
