# frozen_string_literal: true
# This is distinct from Course::Assessment::Answer::RubricBasedResponse::AnswerAdapter
# because we want the evaluation results of playground not to immediately affect actual grades.
class Course::Assessment::Answer::RubricPlaygroundAnswerAdapter <
  Course::Rubric::LlmService::AnswerAdapter
  def initialize(answer, answer_evaluation)
    super()
    @answer = answer
    @answer_evaluation = answer_evaluation
  end

  def answer_text
    return '' unless @answer.specific.is_a?(Course::Assessment::Answer::RubricBasedResponse)

    @answer.specific.answer_text
  end

  def save_llm_results(llm_response)
    category_grades = llm_response['category_grades']

    @answer.class.transaction do
      if @answer_evaluation.selections.empty?
        create_answer_selections
        @answer_evaluation.reload
      end

      update_answer_selections(category_grades)
      @answer_evaluation.feedback = llm_response['feedback']
      @answer_evaluation.save!
    end
  end

  private

  def create_answer_selections
    new_category_selections = @answer_evaluation.rubric.categories.map do |category|
      {
        answer_evaluation_id: @answer_evaluation.id,
        category_id: category.id,
        criterion_id: nil
      }
    end

    selections = Course::Rubric::AnswerEvaluation::Selection.insert_all(new_category_selections)
    raise ActiveRecord::Rollback if !new_category_selections.empty? && (selections.nil? || selections.rows.empty?)
  end

  # Updates the answer's selections and total grade based on the graded categories.
  #
  # @param [Array<Hash>] category_grades The processed category grades.
  # @return [void]
  def update_answer_selections(category_grades)
    selection_lookup = @answer_evaluation.selections.index_by(&:category_id)
    category_grades.map do |grade_info|
      selection = selection_lookup[grade_info[:category_id]]
      if selection
        selection.update!(criterion_id: grade_info[:criterion_id])
      else
        Course::Rubric::AnswerEvaluation::Selection.create!(
          answer_evaluation: @answer_evaluation,
          category_id: grade_info[:category_id],
          criterion_id: grade_info[:criterion_id]
        )
      end
    end
  end
end
