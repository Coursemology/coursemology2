# frozen_string_literal: true
json.grades category.criterions do |criterion|
  json.id criterion.id
  json.grade criterion.grade
  json.explanation criterion.explanation
end
