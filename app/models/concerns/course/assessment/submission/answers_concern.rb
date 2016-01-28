# frozen_string_literal: true
module Course::Assessment::Submission::AnswersConcern
  extend ActiveSupport::Concern

  def latest_answers
    all
  end
end
