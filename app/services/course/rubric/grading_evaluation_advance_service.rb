# frozen_string_literal: true
# When a RubricBasedResponse question's active rubric advances to a new version, re-points each graded
# answer's +grading+ evaluation SELECTIONS at the new rubric, carrying grades forward by category name +
# criterion grade. New categories become ungraded (null selection), removed categories are dropped, and
# answer.grade is recomputed -- preserving any manual moderation delta (answer.grade minus the breakdown
# sum) so a grade only changes by what the rubric change implies. Mirrors the v1 "edit rubric ⇒ new
# categories ungraded" behaviour while keeping the displayed breakdown consistent with the new rubric.
#
# The evaluation's +rubric_id+ is deliberately NOT changed here: it records which rubric the grade was
# EVALUATED against, so leaving it pinned to the previous version flags the grade as "stale" until a grader
# re-applies the active rubric from the playground. Null rubric_id evaluations (manually graded) keep their
# null. Selections are the source of truth for which rubric the breakdown belongs to.
class Course::Rubric::GradingEvaluationAdvanceService
  def initialize(question, new_rubric)
    @question = question      # the RubricBasedResponse question (actable)
    @new_rubric = new_rubric  # the Course::Rubric now active for the question
  end

  def advance!
    Course::Rubric::AnswerEvaluation.transaction do
      grading_evaluations.each { |grading| advance(grading) }
    end
  end

  # Whether there is any graded answer whose grading evaluation selections are not yet on the new rubric --
  # i.e. whether #advance! would actually re-point (and possibly null) any grades.
  def pending?
    grading_evaluations.any?
  end

  private

  # Grading evaluations whose selections do not yet belong to the new rubric. Keyed off the selections'
  # rubric (not the immutable rubric_id) so this still advances manually-graded evaluations (null rubric_id)
  # and never re-processes ones already carried over.
  def grading_evaluations
    answer_ids = Course::Assessment::Answer.where(question_id: @question.acting_as.id).select(:id)
    Course::Rubric::AnswerEvaluation.grading.where(answer_id: answer_ids).
      includes(selections: [:criterion, :category]).
      reject { |grading| selections_on_new_rubric?(grading) }
  end

  def selections_on_new_rubric?(grading)
    grading.selections.any? && grading.selections.all? { |selection| selection.category.rubric_id == @new_rubric.id }
  end

  def advance(grading)
    carried_grades = grade_by_category_name(grading) # { category name => criterion grade }, before rebuild
    moderation = (grading.answer.grade || 0) - carried_grades.values.sum

    grading.selections.destroy_all
    new_breakdown = rebuild_selections(grading, carried_grades)
    # rubric_id is intentionally left untouched (see class comment); only the selections move to @new_rubric.
    assign_answer_grade(grading.answer, new_breakdown + moderation)
  end

  def grade_by_category_name(grading)
    grading.selections.each_with_object({}) do |selection, map|
      map[selection.category.name] = selection.criterion.grade if selection.criterion
    end
  end

  # Recreates one selection per category of the new rubric, carrying forward the matching grade where the
  # category name (and a criterion with that grade) still exists. Returns the new breakdown total.
  def rebuild_selections(grading, carried_grades)
    new_categories.reduce(0) do |breakdown, category|
      grade = carried_grades[category.name]
      criterion = grade && criterion_lookup[category.id][grade]
      grading.selections.create!(category_id: category.id, criterion_id: criterion&.id)
      breakdown + (criterion&.grade || 0)
    end
  end

  # The new rubric's categories, materialised ONCE and reused for every answer advanced in this run.
  def new_categories
    @new_categories ||= @new_rubric.categories.to_a
  end

  # { category id => { grade => criterion } } for the new rubric, built ONCE so carrying a grade forward is
  # an O(1) lookup per category rather than a re-scan of the rubric's criterions for each answer.
  def criterion_lookup
    @criterion_lookup ||= new_categories.to_h { |category| [category.id, category.criterions.index_by(&:grade)] }
  end

  def assign_answer_grade(answer, total)
    answer.update_column(:grade, total.clamp(0, answer.question.maximum_grade))
  end
end
