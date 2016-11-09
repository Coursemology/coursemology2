# frozen_string_literal: true
class Course::Assessment::Answer::AutoGradingService
  class << self
    # Picks the grader for the given answer, then grades into the given
    # +Course::Assessment::Answer::AutoGrading+ object.
    #
    # @param [Course::Assessment::Answer] answer The answer to be graded.
    # @param [Boolean] reattempt Whether to reattempt the answer after grading.
    def grade(answer, reattempt = false)
      answer = pick_grader(answer.question).grade(answer)
      save!(answer, reattempt)
    end

    private

    # Picks the grader to use for the given question.
    #
    # @param [Course::Assessment::Question] question The question that the needs to be graded.
    # @return [Course::Assessment::Answer::AnswerAutoGraderService] The service object that can
    #   grade this question.
    def pick_grader(question)
      question.auto_grader
    end

    # Save the graded answer, a new answer will be created if reattempt is set to true.
    #
    # @param [Course::Assessment::Answer] answer The answer to be graded.
    # @param [Boolean] reattempt Whether to reattempt the answer after grading.
    def save!(answer, reattempt)
      Course::Assessment::Answer.transaction do
        answer.save!
        if reattempt
          new_answer = answer.question.attempt(answer.submission, last_attempt: answer)
          new_answer.save!
          # Move posts to the new answer.
          # TODO: Mount posts under a join table between submission and answer.
          Course::Discussion::Topic.migrate!(from: answer.discussion_topic,
                                             to: new_answer.discussion_topic)
        end
      end
    end
  end

  # Grades into the given +Course::Assessment::Answer::AutoGrading+ object. This does not do
  # anything, except mark the answer as having been graded.
  #
  # Subclasses should call this implementation after they are done to persist the changes to the
  # database.
  #
  # @param [Course::Assessment::Answer] answer The answer to be graded.
  # @return [Course::Assessment::Answer] The graded answer. Note that this answer is not persisted
  #   yet.
  def grade(answer)
    answer.publish!
    answer.grader = User.system
    answer
  end
end
