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

  # Returns the questions which do not have a answer or correct answer.
  #
  # @param [Course::Assessment::Submission] submission The submission which contains the answers.
  # @return [Array<Course::Assessment::Question>]
  def not_correctly_answered(submission)
    where.not(id: submission.answers.where(correct: true).select(:question_id))
  end

  # Return the question at the given step.
  #
  # @param [Course::Assessment::Submission] submission The submission which contains the answers.
  # @return [Array<Course::Assessment::Question>] The question at the given the step. The latest
  #   unfinished question will be returned if the question at the step is not accessible.
  def step(submission, current_step)
    # Make sure index is between [0, length - 1]
    index = [length - 1, [0, current_step.to_i - 1].max].min

    correctly_answered_questions =
      where(id: submission.answers.where(correct: true).select(:question_id))

    index -= 1 while index > 0 && !correctly_answered_questions.include?(fetch(index - 1))

    # Let return type be `ActiveRecord_AssociationRelation`, so that they can be attempted.
    where(id: fetch(index))
  end
end
