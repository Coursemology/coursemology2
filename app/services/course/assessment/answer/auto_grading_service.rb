class Course::Assessment::Answer::AutoGradingService
  class << self
    # Picks the grader for the given grading, then grades into the given
    # +Course::Assessment::Answer::AutoGrading+ object.
    #
    # @param [Course::Assessment::Answer::AutoGrading] auto_grading The object to store grading
    #   results in.
    def grade(auto_grading)
      pick_grader(auto_grading.answer.question).grade(auto_grading)
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
  # @param [Course::Assessment::Answer::AutoGrading] auto_grading The object to store grading
  #   results in.
  # @return [Boolean] True if the grading could be saved.
  def grade(auto_grading)
    auto_grading.answer.publish!
    auto_grading.save
  end
end
