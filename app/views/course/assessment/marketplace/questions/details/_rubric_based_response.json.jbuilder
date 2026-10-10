# frozen_string_literal: true
json.categories(question.active_rubric&.categories || []) do |category|
  json.name category.name
  json.criteria category.criterions do |criterion|
    json.grade criterion.grade
    json.explanation format_ckeditor_rich_text(criterion.explanation)
  end
end
