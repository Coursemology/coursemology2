# frozen_string_literal: true
# Mirrors a source (playground) evaluation into an answer's single +grading+ evaluation -- the official,
# grade-bearing breakdown. The grading evaluation is re-pointed at the source's rubric and its selections
# are rebuilt to match. Shared by auto-grading (RubricBasedResponse::AnswerAdapter) and the playground
# Apply flow (ApplyEvaluationsJob).
class Course::Rubric::GradingEvaluationMirrorService
  # @param [Course::Assessment::Answer] answer The (polymorphic) answer being graded.
  # @param [Course::Rubric::AnswerEvaluation] source_evaluation The playground evaluation to copy from.
  # @return [Course::Rubric::AnswerEvaluation] The persisted grading evaluation.
  def self.mirror(answer, source_evaluation)
    grading = Course::Rubric::AnswerEvaluation.find_or_initialize_by(answer: answer, evaluation_type: :grading)
    grading.update!(rubric: source_evaluation.rubric, feedback: source_evaluation.feedback)
    grading.selections.destroy_all
    source_evaluation.selections.each do |selection|
      grading.selections.create!(category_id: selection.category_id, criterion_id: selection.criterion_id)
    end
    grading
  end

  # Total grade for a grading evaluation: the sum of its selected criterions, clamped to [0, maximum_grade].
  def self.total_grade(grading_evaluation, maximum_grade)
    breakdown = grading_evaluation.selections.includes(:criterion).sum { |selection| selection.criterion&.grade.to_i }
    breakdown.clamp(0, maximum_grade)
  end
end
