module Course::Assessment::QuestionsConcern
  extend ActiveSupport::Concern

  # Attempts the given set of questions.
  #
  # This will create answers for questions without any answers which are not being attempted, and
  # return them in the same order as specified.
  #
  # @param [Course::Assessment::Submission] submission The submission which will contain the
  #   answers.
  # @return [Array<Course::Assessment::Answer>] The answers for the questions, in the same order
  #   specified. Newly initialized answers will not be persisted.
  def attempt(submission)
    attempting_answers = submission.answers.latest_answers.
                         merge(submission.answers.with_attempting_state).
                         where(question: self).
                         map { |answer| [answer.question, answer] }.to_h

    map do |question|
      attempting_answers.fetch(question) { question.attempt(submission) }
    end
  end
end
