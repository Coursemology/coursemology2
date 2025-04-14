# frozen_string_literal: true
json.autogradable question.auto_gradable?

if can_grade && question.auto_gradable?
  json.categories question.categories.each do |category|
    json.id category.id
    json.name category.name
    json.maximumScore category.maximum_score
    json.isBonusCategory category.is_bonus_category

    json.levels category.levels.each do |level|
      json.id level.id
      json.level level.level
      json.explanation format_ckeditor_rich_text(level.explanation)
    end
  end
end
