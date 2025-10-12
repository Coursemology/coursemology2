# frozen_string_literal: true
class Course::Assessment::Question::MockAnswer::AnswerAdapter <
  Course::Rubric::LlmService::AnswerAdapter

  def initialize(mock_answer, mock_answer_evaluation)
    @mock_answer = mock_answer
    @mock_answer_evaluation = mock_answer_evaluation
  end

  def answer_text
    @mock_answer.answer_text
  end

  def save_llm_results(llm_response)
    category_grades = llm_response['category_grades']

    @mock_answer.class.transaction do
      if @mock_answer_evaluation.selections.empty?
        create_answer_selections
        @mock_answer_evaluation.reload
      end
      
      update_answer_selections(category_grades)
      @mock_answer_evaluation.feedback = llm_response['feedback']
      @mock_answer_evaluation.save!
    end      
  end

  private

  def create_answer_selections
    new_category_selections = @mock_answer_evaluation.rubric.categories.map do |category|
      {
        mock_answer_evaluation_id: @mock_answer_evaluation.id,
        category_id: category.id,
        criterion_id: nil
      }
    end

    selections = Course::Rubric::MockAnswerEvaluation::Selection.insert_all(new_category_selections)
    raise ActiveRecord::Rollback if !new_category_selections.empty? && (selections.nil? || selections.rows.empty?)
  end

  # Updates the answer's selections and total grade based on the graded categories.
  #
  # @param [Array<Hash>] category_grades The processed category grades.
  # @return [void]
  def update_answer_selections(category_grades)
    selection_lookup = @mock_answer_evaluation.selections.index_by(&:category_id)
    category_grades.map do |grade_info|
      selection = selection_lookup[grade_info[:category_id]]
      if selection
        selection.update!(criterion_id: grade_info[:criterion_id])
      else
        Course::Rubric::MockAnswerEvaluation::Selection.create!(
          mock_answer_evaluation: @mock_answer_evaluation,
          category_id: grade_info[:category_id],
          criterion_id: grade_info[:criterion_id]
        )
      end
    end
  end
end
