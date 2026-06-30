# frozen_string_literal: true
active_rubric_id = @question.active_rubric_id

json.array! @rubrics do |rubric|
  json.partial! 'course/rubrics/rubric', rubric: rubric
  json.isActive rubric.id == active_rubric_id
end
