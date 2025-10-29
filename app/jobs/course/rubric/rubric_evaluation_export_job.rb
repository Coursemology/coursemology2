# frozen_string_literal: true
class Course::Rubric::RubricEvaluationExportJob < ApplicationJob # rubocop:disable Metrics/ClassLength
  include TrackableJob
  queue_as :highest

  def perform_tracked(course, rubric_id, question_id)
    question = Course::Assessment::Question.includes(:actable).find(question_id)
    rubric_based_response_question = question.specific
    rubric = course.rubrics.find(rubric_id)
    question.transaction do
      answers_to_export = load_answers_and_evaluations(rubric, question)
      export_rubric_to_rubric_based_response_question(rubric, rubric_based_response_question)
      exported_categories_hash, exported_criterions_hash =
        build_exported_rubric_hashes(rubric, rubric_based_response_question)

      export_answer_rubric_grading_data(rubric, answers_to_export, exported_categories_hash, exported_criterions_hash)
    end
  end

  private

  def load_answers_and_evaluations(rubric, question)
    answers_to_export = question.answers.without_attempting_state.where(
      actable_type: 'Course::Assessment::Answer::RubricBasedResponse'
    ).includes(:actable, { rubric_evaluations: :selections })

    # Evaluate all answers that haven't been evaluated
    answers_to_export.
      filter { |answer| answer.rubric_evaluations.where(rubric: rubric).empty? }.
      each do |answer|
        evaluate_answer(answer, rubric)
        answer.reload
      end

    answers_to_export
  end

  def evaluate_answer(answer, rubric)
    answer_evaluation =
      rubric.answer_evaluations.find_by(answer: answer) ||
      Course::Rubric::AnswerEvaluation.create({
        rubric: rubric,
        answer: answer
      })

    question_adapter = Course::Assessment::Question::QuestionAdapter.new(answer.question)
    rubric_adapter = Course::Rubric::RubricAdapter.new(rubric)
    answer_adapter = Course::Assessment::Answer::RubricPlaygroundAnswerAdapter.new(answer, answer_evaluation)

    llm_response = Course::Rubric::LlmService.new(question_adapter, rubric_adapter, answer_adapter).evaluate
    answer_adapter.save_llm_results(llm_response)
  end

  # Wipe out old rubric and selections
  # Insert new rubric, map original rubric ids to exported rubric ids
  def export_rubric_to_rubric_based_response_question(rubric, rubric_based_response_question)
    destroy_attributes =
      rubric_based_response_question.categories.includes(:criterions).without_bonus_category.map do |category|
        {
          id: category.id,
          _destroy: true
        }
      end
    create_attributes = rubric.categories.map do |category|
      {
        name: category.name,
        criterions_attributes: category.criterions.map do |criterion|
          {
            grade: criterion.grade,
            explanation: criterion.explanation
          }
        end
      }
    end
    rubric_based_response_question.update(
      ai_grading_custom_prompt: rubric.grading_prompt,
      ai_grading_model_answer: rubric.model_answer,
      categories_attributes: destroy_attributes + create_attributes
    )
    rubric_based_response_question.reload
  end

  def build_exported_rubric_hashes(rubric, rubric_based_response_question)
    source_categories = rubric.categories
    destination_categories = rubric_based_response_question.categories
    exported_criterions_hash = {}
    exported_categories_hash = source_categories.zip(destination_categories).to_h do |src_category, dest_category|
      src_category.criterions.order(:grade).
        zip(dest_category.criterions.order(:grade)).
        each do |src_criterion, dest_criterion|
          exported_criterions_hash[src_criterion.id] = dest_criterion.id
        end

      [src_category.id, dest_category.id]
    end

    [exported_categories_hash, exported_criterions_hash]
  end

  def update_answer_grade_and_feedback(answer, answer_evaluation)
    Course::Assessment::Answer::AiGeneratedPostService.
      new(answer, answer_evaluation.feedback).create_ai_generated_draft_post

    total_grade = answer_evaluation.selections.sum { |selection| selection.criterion.grade }
    answer.grade = total_grade
    answer.save!
  end

  def build_answer_v1_selections(answer_evaluation, exported_categories_hash, exported_criterions_hash)
    answer_evaluation.selections.map do |selection|
      {
        answer_id: answer_evaluation.answer.actable_id,
        category_id: exported_categories_hash[selection.category_id],
        criterion_id: exported_criterions_hash[selection.criterion_id]
      }
    end
  end

  def export_answer_rubric_grading_data(rubric, answers_to_export, exported_categories_hash, exported_criterions_hash)
    # Update feedback draft post (if any), total grade, and rebuild selections
    new_category_selections = answers_to_export.flat_map do |answer|
      answer_evaluation = answer.rubric_evaluations.find_by(rubric: rubric)
      next if answer_evaluation.nil?

      update_answer_grade_and_feedback(answer, answer_evaluation)
      build_answer_v1_selections(answer_evaluation, exported_categories_hash, exported_criterions_hash)
    end.compact

    selections = Course::Assessment::Answer::RubricBasedResponseSelection.insert_all(new_category_selections)
    raise ActiveRecord::Rollback if !new_category_selections.empty? && (selections.nil? || selections.rows.empty?)
  end
end
