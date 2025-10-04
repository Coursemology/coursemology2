# frozen_string_literal: true

json.rubrics @rubrics do |rubric|
  json.partial! 'rubric', rubric: rubric
end
