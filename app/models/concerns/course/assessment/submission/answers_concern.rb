module Course::Assessment::Submission::AnswersConcern
  extend ActiveSupport::Concern

  def latest_answers
    all
  end
end
