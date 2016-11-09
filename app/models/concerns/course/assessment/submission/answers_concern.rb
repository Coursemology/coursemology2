# frozen_string_literal: true
module Course::Assessment::Submission::AnswersConcern
  extend ActiveSupport::Concern

  # Scope to obtain the latest answers for each question for Course::Assessment::Submission.
  # TODO: Remove this and use submission#latest_answers instead. Requires refactoring on
  #         assessment.questions#attempt
  def latest_answers
    unscope(:order).select('DISTINCT ON (question_id) *').order(:question_id, created_at: :desc).
      without_reattempting_state
  end

  # Load the answers of specific question.
  def from_question(question_id)
    if loaded?
      select { |a| a.question_id == question_id }
    else
      where(question_id: question_id)
    end
  end
end
