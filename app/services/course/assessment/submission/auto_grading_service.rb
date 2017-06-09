# frozen_string_literal: true
#
# Service to execute Course::Assessment::Submission::AutoGradingJob
class Course::Assessment::Submission::AutoGradingService
  class << self
    # Grades into the given submission.
    #
    # @param [Course::Assessment::Submission] submission The submission to grade.
    delegate :grade, to: :new
  end

  class SubJobError < StandardError
  end

  MAX_TRIES = 5

  # Grades into the given submission. This only grades ungraded answers.
  #
  # @param [Course::Assessment::Submission] submission The object to store grading
  #   results in.
  # @return [Boolean] True if the grading could be saved.
  def grade(submission)
    grade_answers(submission)
    submission.reload
    assign_exp_and_publish_grade(submission) if submission.assessment.autograded?
    submission.save!
  end

  private

  # Grades the answers in the provided submission.
  #
  # Retries are implemented in the case where a race condition occurs, ie. when a new
  # attempting answer is created after the submission is finalised, but before the
  # autograding job is run for the submission.
  def grade_answers(submission)
    tries, jobs_by_qn = 0, {}
    ungraded_answers = ungraded_answers(submission)
    while ungraded_answers.any? && tries <= MAX_TRIES
      new_jobs = ungraded_answers.map { |a| [a.question_id, grade_answer(a)] }.
                 select { |e| e[1].present? }.to_h # Filter out answers which does not return a job
      wait_for_jobs(new_jobs.values)

      jobs_by_qn.merge!(new_jobs)
      ungraded_answers = ungraded_answers(submission)
      tries += 1
    end
    aggregate_failures(jobs_by_qn.map { |_, job| job.job.reload })
  end

  # Grades the provided answer
  #
  # @param [Course::Assessment::Answer] answer The answer to grade.
  # @return [Course::Assessment::Answer::AutoGradingJob] The job created to grade.
  def grade_answer(answer)
    raise ArgumentError if answer.changed?
    answer.auto_grade!(reduce_priority: true)
    # Catch errors if answer is in attempting state, caused by a race condition where
    # a new attempting answer is created while the submission is finalised, but before the
    # autograding job is executed.
  rescue IllegalStateError
    answer.finalise!
    answer.save!
    answer.auto_grade!(reduce_priority: true)
  end

  # Waits for the given list of +TrackableJob::Job+s to enter the finished state.
  #
  # @param [Array<Course::Assessment::Answer::AutoGradingJob>] jobs The jobs to wait.
  def wait_for_jobs(jobs)
    jobs.each(&:wait)
  end

  # Aggregates the failures in the given jobs and fails this job if there were any failures.
  #
  # @param [Array<TrackableJob::Job>] jobs The jobs to aggregate failrues for.
  # @raise [StandardError]
  def aggregate_failures(jobs)
    failed_jobs = jobs.select(&:errored?)
    return if failed_jobs.empty?

    error_messages = failed_jobs.map { |job| job.error['message'] }
    raise SubJobError, error_messages.to_sentence
  end

  def assign_exp_and_publish_grade(submission)
    submission.points_awarded = calculate_exp(submission).to_i
    submission.publish!
  end

  # Gets the ungraded answers for the given submission
  def ungraded_answers(submission)
    submission.reload.latest_answers.select { |a| a.attempting? || a.submitted? }
  end

  # Calculating scheme:
  #   Submit before bonus cutoff: ( base_exp + bonus_exp ) * actual_grade / max_grade
  #   Submit after bonus cutoff: base_exp * actual_grade / max_grade
  #   Submit after end_at: 0
  def calculate_exp(submission)
    assessment = submission.assessment
    end_at = assessment.end_at
    bonus_end_at = assessment.bonus_end_at
    total_exp = assessment.base_exp
    return 0 if end_at && submission.submitted_at > end_at
    if bonus_end_at && submission.submitted_at <= bonus_end_at
      total_exp += assessment.time_bonus_exp
    end

    maximum_grade = assessment.maximum_grade
    maximum_grade == 0 ? total_exp : submission.grade.to_f / maximum_grade * total_exp
  end
end
