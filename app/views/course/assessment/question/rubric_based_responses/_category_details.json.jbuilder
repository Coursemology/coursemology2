# frozen_string_literal: true
json.categories question.categories.without_bonus_category do |category|
  json.id category.id
  json.name category.name
  json.maximumScore category.maximum_score

  json.partial! 'level_details', category: category
end
