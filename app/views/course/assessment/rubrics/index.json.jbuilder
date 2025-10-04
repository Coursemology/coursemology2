# frozen_string_literal: true

json.rubrics @rubrics do |rubric|
  json.partial! 'course/rubrics/rubric', rubric: rubric
end
