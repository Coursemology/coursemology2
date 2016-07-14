# frozen_string_literal: true
module Course::Assessment::Submission::AnswersConcern
  extend ActiveSupport::Concern

  # Scope to obtain the latest answers for each question for Course::Assessment::Submission.
  def latest_answers
    select('DISTINCT ON (question_id) *').order(:question_id, created_at: :desc)
  end
end
