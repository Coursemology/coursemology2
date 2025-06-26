# frozen_string_literal: true
json.aiGradingEnabled question.ai_grading_enabled? if can_grade
if can_grade || (@assessment.show_rubric_to_students? && answer.submission.published?)
  json.categories question.categories.each do |category|
    json.id category.id
    json.name category.name
    json.maximumGrade category.criterions.map(&:grade).compact.max
    json.isBonusCategory category.is_bonus_category

    json.grades category.criterions.each do |criterion|
      json.id criterion.id
      json.grade criterion.grade
      json.explanation format_ckeditor_rich_text(criterion.explanation)
    end
  end
else
  json.categories []
end
