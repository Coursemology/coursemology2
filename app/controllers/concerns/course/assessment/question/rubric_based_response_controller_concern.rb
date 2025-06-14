# frozen_string_literal: true
module Course::Assessment::Question::RubricBasedResponseControllerConcern
  include Course::Assessment::Question::RubricBasedResponseQuestionConcern
  extend ActiveSupport::Concern

  def create_new_category_grade_instances(new_category_ids)
    answers = Course::Assessment::Answer.where(
      actable_type: 'Course::Assessment::Answer::RubricBasedResponse',
      question_id: @rubric_based_response_question.acting_as.id
    ).includes(:actable).map(&:actable)

    new_category_selections = answers.product(new_category_ids).map do |answer, category_id|
      {
        answer_id: answer.id,
        category_id: category_id,
        criterion_id: nil,
        grade: nil,
        explanation: nil
      }
    end

    selections = Course::Assessment::Answer::RubricBasedResponseSelection.insert_all(new_category_selections)
    raise ActiveRecord::Rollback if !new_category_selections.empty? && (selections.nil? || selections.rows.empty?)

    true
  end

  def update_all_submission_answer_grades
    all_assessment_submission_ids = @assessment.submissions.map(&:id)
    @all_rubric_based_response_answers = Course::Assessment::Answer.where(
      submission_id: all_assessment_submission_ids,
      actable_type: 'Course::Assessment::Answer::RubricBasedResponse'
    ).includes(:question, actable: [selections: :criterion])

    answer_score_array = construct_answer_score_array

    raise ActiveRecord::Rollback unless Course::Assessment::Answer.upsert_all(answer_score_array, update_only: :grade,
                                                                                                  unique_by: :id)

    true
  end

  def preload_criterions_per_category
    @rubric_based_response_question = Course::Assessment::Question::RubricBasedResponse.
                                      includes(categories: :criterions).
                                      find(@rubric_based_response_question.id)
  end
end
