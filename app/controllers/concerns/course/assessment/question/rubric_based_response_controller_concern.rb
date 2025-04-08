# frozen_string_literal: true
module Course::Assessment::Question::RubricBasedResponseControllerConcern
  include Course::Assessment::Question::RubricBasedResponseQuestionConcern
  extend ActiveSupport::Concern

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
