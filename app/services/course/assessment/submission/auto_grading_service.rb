class Course::Assessment::Submission::AutoGradingService
  class << self
    # Grades into the given submission.
    #
    # @param [Course::Assessment::Submission] submission The submission to grade.
    delegate :grade, to: :new
  end

  class SubJobError < StandardError
  end

  # Grades into the given submission. This only grades ungraded answers.
  #
  # @param [Course::Assessment::Submission] submission The object to store grading
  #   results in.
  # @return [Boolean] True if the grading could be saved.
  def grade(submission)
    grade_answers(submission)
    submission.save!
  end

  private

  # Grades the answers in the provided submission which has not yet been graded.
  def grade_answers(submission)
    jobs = ungraded_answers(submission).map do |answer|
      grade_answer(answer).job
    end

    wait_for_jobs(jobs)
    aggregate_failures(jobs)
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
  #
  # @param [Array<TrackableJob::Job>] jobs The jobs to wait.
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

  # Aggregates the failures in the given jobs and fails this job if there were any failures.
  #
  # @param [Array<TrackableJob::Job>] jobs The jobs to aggregate failrues for.
  # @raise [StandardError]
  def aggregate_failures(jobs)
    failed_jobs = jobs.select(&:errored?)
    return if failed_jobs.empty?

    error_messages = failed_jobs.map { |job| job.error['message'] }
    fail SubJobError, error_messages.to_sentence
  end
end
