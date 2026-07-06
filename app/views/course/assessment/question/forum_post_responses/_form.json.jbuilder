# frozen_string_literal: true
json.partial! 'course/assessment/question/skills', course: course

# Grading mode + the modes this type supports. The frontend renders a grading-mode switch only when more
# than one mode is supported (forum posts support default + rubric).
json.gradingMode question.grading_mode
json.supportedGradingModes question.supported_grading_modes

# Rubric configuration (shown/forwarded only under rubric grading mode). Built directly on the v2
# Course::Rubric and emitted in the same shape the RBR category manager consumes, so the frontend reuses it.
active_rubric = question.active_rubric
json.aiGradingEnabled question.ai_grading_enabled?
json.aiGradingCustomPrompt active_rubric&.grading_prompt || ''
json.aiGradingModelAnswer active_rubric&.model_answer || ''
json.categories(active_rubric&.categories || []) do |category|
  json.id category.id
  json.name category.name
  json.maximumGrade category.criterions.map(&:grade).compact.max

  json.grades category.criterions do |criterion|
    json.id criterion.id
    json.grade criterion.grade
    json.explanation format_ckeditor_rich_text(criterion.explanation)
  end
end

json.partial! 'course/assessment/question/grading_context_fields', question: question, assessment: @assessment
