# frozen_string_literal: true
# Applies a rubric version's evaluations to the official grades of the given answers. For each answer it
# reuses the existing +llm+ evaluation for (answer, rubric) when present (no re-run), otherwise evaluates
# once; then mirrors that evaluation into the answer's +grading+ evaluation, sets the grade, and drafts an
# AI feedback post. Replaces the old v1 "export to RubricBasedResponse" job.
class Course::Rubric::ApplyEvaluationsJob < ApplicationJob
  include TrackableJob

  queue_as :highest

  def perform_tracked(course, rubric_id, answer_ids)
    rubric = course.rubrics.find(rubric_id)
    Course::Assessment::Answer.where(id: answer_ids).includes(:actable).find_each do |answer|
      apply(rubric, answer)
    end
  end

  private

  def apply(rubric, answer)
    evaluation = rubric.answer_evaluations.playground_types.find_by(answer: answer) || evaluate(rubric, answer)

    grading = Course::Rubric::GradingEvaluationMirrorService.mirror(answer, evaluation)
    grade = Course::Rubric::GradingEvaluationMirrorService.total_grade(grading, answer.question.maximum_grade)
    answer.update_column(:grade, grade)
    Course::Assessment::Answer::AiGeneratedPostService.new(answer, grading.feedback).create_ai_generated_draft_post
  end

  # Runs the LLM once for an answer with no (visible) playground evaluation for this rubric, populating a
  # fresh one (the playground adapter writes selections only -- it does not touch the grade/grading eval).
  def evaluate(rubric, answer)
    evaluation = Course::Rubric::AnswerEvaluation.find_or_build_playground(answer: answer, rubric: rubric)
    # Applying populates the playground evaluation but keeps a brand-new one hidden from the playground table.
    evaluation.evaluation_type = :playground_hidden if evaluation.new_record?
    evaluation.save!
    question_adapter = Course::Assessment::Question::QuestionAdapter.new(answer.question)
    rubric_adapter = Course::Rubric::RubricAdapter.new(rubric)
    answer_adapter = Course::Assessment::Answer::RubricPlaygroundAnswerAdapter.new(answer, evaluation)

    llm_response = Course::Rubric::LlmService.new(question_adapter, rubric_adapter, answer_adapter).evaluate
    answer_adapter.save_llm_results(llm_response)
    evaluation.reload
  end
end
