# frozen_string_literal: true
json.levels category.levels do |level|
  json.id level.id
  json.level level.level
  json.explanation level.explanation
end
