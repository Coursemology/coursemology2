# frozen_string_literal: true

json.array! @rubrics do |rubric|
  json.partial! 'course/rubrics/rubric', rubric: rubric
end
