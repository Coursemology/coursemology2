# frozen_string_literal: true
class Course::Assessment::Answer::RubricBasedResponse::AnswerAdapter <
  Course::Rubric::LlmService::AnswerAdapter
  def initialize(answer)
    super()
    @answer = answer
  end

  def answer_text
    @answer.answer_text
  end

  def save_llm_results(llm_response)
    category_grades = llm_response['category_grades']

    # For rubric-based questions, update the answer's selections and grade to database
    update_answer_selections(@answer, category_grades)
    update_answer_grade(@answer, category_grades)
  end

  private

  # Updates the answer's selections and total grade based on the graded categories.
  #
  # @param [Array<Hash>] category_grades The processed category grades.
  # @return [void]
  def update_answer_selections(answer, category_grades)
    if answer.selections.empty?
      answer.create_category_grade_instances
      answer.reload
    end
    selection_lookup = answer.selections.index_by(&:category_id)
    params = {
      selections_attributes: category_grades.map do |grade_info|
        selection = selection_lookup[grade_info[:category_id]]
        next unless selection

        {
          id: selection.id,
          criterion_id: grade_info[:criterion_id],
          grade: grade_info[:grade],
          explanation: grade_info[:explanation]
        }
      end.compact
    }
    answer.assign_params(params)
  end

  # Updates the answer's total grade based on the graded categories.
  # @param [Array<Hash>] category_grades The processed category grades.
  # @return [void]
  def update_answer_grade(answer, category_grades)
    grade_lookup = category_grades.to_h { |info| [info[:category_id], info[:grade]] }
    total_grade = answer.selections.includes(:criterion).sum do |selection|
      grade_lookup[selection.category_id] || selection.criterion&.grade || selection.grade || 0
    end
    total_grade = total_grade.clamp(0, answer.question.maximum_grade)
    answer.grade = total_grade
  end
end
