# frozen_string_literal: true
json.id grading_context.id
json.identifier grading_context.identifier
json.contextType grading_context.context_type
# The sibling source question's title (used in the field heading); nil for intrinsic providers (forum thread).
json.sourceTitle grading_context.source&.title
