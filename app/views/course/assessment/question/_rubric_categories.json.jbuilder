# frozen_string_literal: true
# Emits the active rubric's categories for the submission view, shared by rubric-graded question types (RBR,
# forum post). The rubric panel/moderation row read these to render and save; the visibility rule mirrors the
# categoryGrades gate. Empty array when hidden or the question has no active rubric. Expects +question+ (the
# actable question), +answer+, and +can_grade+ locals. (Bonus categories no longer exist in v2.)
if can_grade || (@assessment.show_rubric_to_students? && answer.submission.published?)
  rubric_categories = question.active_rubric&.categories || []
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
