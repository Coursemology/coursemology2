# frozen_string_literal: true
json.aiGradingEnabled question.ai_grading_enabled? if can_grade

json.autogradable false
json.templateText question.template_text
if can_grade || (@assessment.show_rubric_to_students? && answer.submission.published?)
  # Show the categories of the active rubric (Bonus categories no longer exist in v2.)
  graded_rubric = question.active_rubric
  rubric_categories = graded_rubric&.categories || []
  json.categories rubric_categories do |category|
    json.id category.id
    json.name category.name
    json.maximumGrade category.criterions.map(&:grade).compact.max

    json.grades category.criterions do |criterion|
      json.id criterion.id
      json.grade criterion.grade
      json.explanation format_ckeditor_rich_text(criterion.explanation)
    end
  end
else
  json.categories []
end
