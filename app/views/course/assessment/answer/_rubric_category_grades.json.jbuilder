# frozen_string_literal: true
# Emits categoryGrades for any rubric-graded answer (RBR, forum post, ...). Its presence in the payload is
# what drives the rubric UI in the submission view, regardless of question type.
if can_grade || (@assessment.show_rubric_to_students? && @submission.published?)
  # The official grade breakdown lives on the v2 grading evaluation (selections keyed by the graded rubric's
  # category/criterion ids). Grade comes from the immutable criterion; an ungraded category has no criterion.
  grading_selections = answer.acting_as.grading_rubric_evaluation&.selections&.includes(:criterion) || []
  # Only the criterion breakdown is sent; the FE derives the "moderation" adjustment as answer.grade minus
  # this breakdown (it is not a real category/selection in v2).
  json.categoryGrades grading_selections do |selection|
    criterion = selection.criterion

    json.id selection.id
    json.gradeId criterion&.id
    json.categoryId selection.category_id
    json.grade criterion&.grade
    # The selected criterion's (rubric-level) explanation; v2 no longer stores a per-answer explanation.
    json.explanation criterion ? format_ckeditor_rich_text(criterion.explanation) : nil
  end
end
