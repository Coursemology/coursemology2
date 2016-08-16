# frozen_string_literal: true
class Course::Assessment::Answer::AutoGradingService
  class << self
    # Picks the grader for the given answer, then grades into the given
    # +Course::Assessment::Answer::AutoGrading+ object.
    #
    # @param [Course::Assessment::Answer] answer The answer to be graded.
    def grade(answer)
      pick_grader(answer.question).grade(answer)
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
  end

  # Grades into the given +Course::Assessment::Answer::AutoGrading+ object. This does not do
  # anything, except mark the answer as having been graded.
  #
  # Subclasses should call this implementation after they are done to persist the changes to the
  # database.
  #
  # @param [Course::Assessment::Answer] answer The answer to be graded.
  # @return [Boolean] True if the grading could be saved.
  def grade(answer)
    answer.publish!
    answer.grader = User.system
    answer.save
  end
end
