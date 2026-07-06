# frozen_string_literal: true
# Shared v2-rubric answer adapter: writes auto-grading results onto the v2 Course::Rubric stack for any
# rubric-graded answer type. On each grading run it:
#   1. upserts the +playground+ evaluation for (answer, active_rubric) with the LLM's raw selections
#      (un-hiding it if it had been dismissed), then
#   2. mirrors it into the answer's single +grading+ evaluation (the official, grade-bearing breakdown),
#      re-pointing it at the active_rubric, and
#   3. assigns answer.grade from the selected criterions (the surrounding AutoGradingService persists it).
# Subclasses supply #answer_text (the text handed to the LLM) -- the only type-specific piece.
class Course::Assessment::Answer::RubricGrading::AnswerAdapter < Course::Rubric::LlmService::AnswerAdapter
  def initialize(answer, rubric)
    super()
    @answer = answer
    @rubric = rubric
  end

  def save_llm_results(llm_response)
    Course::Assessment::Answer.transaction do
      playground_evaluation = upsert_playground_evaluation(llm_response)
      grading_evaluation = Course::Rubric::GradingEvaluationMirrorService.mirror(
        @answer.acting_as, playground_evaluation
      )
      @answer.grade = Course::Rubric::GradingEvaluationMirrorService.total_grade(
        grading_evaluation, @answer.question.maximum_grade
      )
    end
  end

  private

  # The raw LLM record for this rubric version (unique per (answer, rubric); un-hidden if dismissed).
  def upsert_playground_evaluation(llm_response)
    evaluation = Course::Rubric::AnswerEvaluation.find_or_build_playground(answer: @answer.acting_as, rubric: @rubric)
    # Auto-grading populates the playground evaluation but keeps a brand-new one hidden, so background
    # grading does not surface rows in the playground table (the user un-hides by evaluating there).
    evaluation.evaluation_type = :playground_hidden if evaluation.new_record?
    evaluation.feedback = llm_response['feedback']
    evaluation.save!
    evaluation.selections.destroy_all
    llm_response['category_grades'].each do |grade_info|
      evaluation.selections.create!(category_id: grade_info[:category_id], criterion_id: grade_info[:criterion_id])
    end
    evaluation
  end
end
