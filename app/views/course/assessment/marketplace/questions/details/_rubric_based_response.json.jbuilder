# frozen_string_literal: true
json.categories question.categories do |category|
  json.name category.name
  json.isBonus category.is_bonus_category
  json.criteria category.criterions do |criterion|
    json.grade criterion.grade
    json.explanation format_ckeditor_rich_text(criterion.explanation)
  end
end
