# frozen_string_literal: true

json.id rubric.id
json.createdAt rubric.created_at.iso8601
json.questions rubric.questions.map(&:id)
json.gradingPrompt rubric.grading_prompt

json.categories rubric.categories.each do |category|
  json.id category.id
  json.name category.name
  json.maximumGrade category.criterions.map(&:grade).compact.max
  json.isBonusCategory category.is_bonus_category

  json.criterions category.criterions.each do |criterion|
    json.id criterion.id
    json.grade criterion.grade
    json.explanation format_ckeditor_rich_text(criterion.explanation)
  end
end
