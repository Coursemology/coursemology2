class Course::Assessment::Submission::AutoGradingService
  class << self
    # Grades into the given submission.
    #
    # @param [Course::Assessment::Submission] submission The submission to grade.
    delegate :grade, to: :new
  end

  # Grades into the given submission. This only grades ungraded answers.
  #
  # @param [Course::Assessment::Submission] submission The object to store grading
  #   results in.
  # @return [Boolean] True if the grading could be saved.
  def grade(submission)
    grade_answers(submission)
    submission.publish!
    submission.save!
  end

  private

  # Grades the answers in the provided submission which has not yet been graded.
  def grade_answers(submission)
    jobs = ungraded_answers(submission).map do |answer|
      grade_answer(answer).job
    end

    wait_for_jobs(jobs)
  end

  # Gets the ungraded answers for the given submission
  def ungraded_answers(submission)
    submission.answers.select(&:submitted?)
  end

  # Grades the provided answer
  #
  # @param [Course::Assessment::Answer] answer The answer to grade.
  # @return [Course::Assessment::Answer::AutoGradingJob] The job created to grade.
  def grade_answer(answer)
    fail ArgumentError if answer.changed?
    answer.auto_grade!
  end

  # Waits for the given list of +TrackableJob::Job+s to enter the finished state.
  #
  # TODO: This uses polling, find a way to make this more efficient.
  def wait_for_jobs(jobs)
    loop do
      jobs.each(&:reload)
      if jobs.any?(&:submitted?)
        sleep 0.1
      else
        break
      end
    end
  end
end
