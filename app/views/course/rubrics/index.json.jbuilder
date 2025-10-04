# frozen_string_literal: true

json.array! @rubrics do |rubric|
  json.partial! 'rubric', rubric: rubric
end
