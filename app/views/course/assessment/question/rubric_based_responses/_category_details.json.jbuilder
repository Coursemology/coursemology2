# frozen_string_literal: true
json.categories question.categories.without_bonus_category do |category|
  json.id category.id
  json.name category.name
  json.maximumGrade category.criterions.map(&:grade).compact.max

  json.partial! 'grade_details', category: category
end
