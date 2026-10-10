# frozen_string_literal: true
json.partial! 'course/assessment/question/skills', course: course

json.templateText question.template_text
json.isAssessmentAutograded assessment.autograded?
json.aiGradingEnabled question.ai_grading_enabled?

# The rubric is read from the question's v2 active rubric (the deprecated v1 rubric rows are not read).
active_rubric = question.active_rubric
json.aiGradingCustomPrompt active_rubric&.grading_prompt || ''
json.aiGradingModelAnswer active_rubric&.model_answer || ''
json.categories(active_rubric&.categories || []) do |category|
  json.id category.id
  json.name category.name
  json.maximumGrade category.criterions.map(&:grade).compact.max

  json.grades category.criterions do |criterion|
    json.id criterion.id
    json.grade criterion.grade
    json.explanation sanitize_ckeditor_rich_text(criterion.explanation)
  end
end

json.partial! 'course/assessment/question/grading_context_fields', question: question, assessment: assessment
