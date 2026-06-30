# frozen_string_literal: true
class Course::Assessment::Question::QuestionRubric < ApplicationRecord
  self.table_name = 'course_assessment_question_rubrics'

  belongs_to :rubric, inverse_of: :question_rubrics
  belongs_to :question, class_name: 'Course::Assessment::Question', inverse_of: :question_rubrics

  # When a question is destroyed its join rows go too (dependent: :destroy). If that removes the last link
  # to a rubric, the rubric is now orphaned, so destroy it (and its categories/criterions/evaluations) --
  # deleting a question should leave nothing behind. Guarded against the rubric being destroyed directly.
  after_destroy :destroy_orphaned_rubric

  private

  # Only destroy a now-unlinked rubric when it also has no evaluations left: an evaluation's grade points at
  # its rubric (rubric_id / its selections' categories), so a rubric that still backs a grade must survive
  # even after it is unlinked from every question (see RubricsController#destroy for the kept-evaluation case).
  def destroy_orphaned_rubric
    return if rubric.nil? || rubric.destroyed?

    rubric.destroy if rubric.question_rubrics.reload.empty? && rubric.answer_evaluations.reload.empty?
  end
end
