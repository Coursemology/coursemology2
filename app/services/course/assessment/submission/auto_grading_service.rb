# frozen_string_literal: true
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
    submission.reload
    publish_grade(submission) if submission.assessment.autograded?
    submission.save!
  end

  private

  # Grades the answers in the provided submission which are auto gradable.
  def grade_answers(submission)
    auto_gradable_answers = submission.latest_answers.select do |answer|
      answer.question.auto_gradable?
    end
    jobs = auto_gradable_answers.map { |answer| grade_answer(answer) }

    wait_for_jobs(jobs)
    aggregate_failures(jobs.map { |job| job.job.reload })
  end

  # Grades the provided answer
  #
  # @param [Course::Assessment::Answer] answer The answer to grade.
  # @return [Course::Assessment::Answer::AutoGradingJob] The job created to grade.
  def grade_answer(answer)
    raise ArgumentError if answer.changed?
    answer.auto_grade!
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

  def publish_grade(submission)
    submission.points_awarded = calculate_exp(submission).to_i
    submission.publish!
  end

  # Calculating scheme:
  #   Submit before bonus cutoff: ( base_exp + bonus_exp ) * actual_grade / max_grade
  #   Submit after bonus cutoff: base_exp * actual_grade / max_grade
  def calculate_exp(submission)
    assessment = submission.assessment
    bonus_end_at = assessment.bonus_end_at
    total_exp = assessment.base_exp
    if !bonus_end_at || submission.submitted_at <= bonus_end_at
      total_exp += assessment.time_bonus_exp
    end

    maximum_grade = assessment.maximum_grade
    maximum_grade == 0 ? total_exp : submission.grade.to_f / maximum_grade * total_exp
  end
end
