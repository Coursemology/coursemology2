# frozen_string_literal: true
module Course::Assessment::Question::RubricBasedResponseQuestionConcern
  extend ActiveSupport::Concern

  def construct_answer_score_array
    @all_rubric_based_response_answers.filter_map do |answer|
      selections = answer.actable&.selections
      next unless selections

      answer_object(answer, total_grade_for(selections, answer.question.maximum_grade))
    end
  end

  def total_grade_for(selections, maximum_grade)
    total_grade = selections.sum { grade_value(_1) }

    total_grade.clamp(0, maximum_grade)
  end

  def grade_value(selection)
    selection.grade.presence || selection.criterion&.grade.to_i
  end

  def answer_object(answer, total_grade)
    { id: answer.id, submission_id: answer.submission_id, question_id: answer.question_id, grade: total_grade,
      workflow_state: answer.workflow_state, correct: answer.correct, submitted_at: answer.submitted_at }
  end
end
