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

  # Grades into the given submission.
  #
  # @param [Course::Assessment::Submission] submission The object to store grading
  #   results in.
  # @return [Boolean] True if the grading could be saved.
  def grade(submission)
    grade_answers(submission)
    submission.reload

    # To address race condition where a submission is unsubmitted when answers are being graded
    unsubmit_answers(submission) if submission.assessment.autograded? && submission.attempting?
    assign_exp_and_publish_grade(submission) if submission.assessment.autograded? && submission.submitted?
    submission.save!
  rescue SubjobNotCompletedError
    # When the answers evaluation are not completed, queue the submission autograding job again
    # and end the current job to free up a thread in the worker's machine.
    Course::Assessment::Submission::AutoGradingJob.perform_later(submission)
  end

  private

  # Grades the answers in the provided submission.
  def grade_answers(submission)
    jobs_by_qn = {}
    answers_to_grade = ungraded_answers(submission)
    if answers_to_grade.any?
      new_jobs = build_answer_grading_jobs(answers_to_grade)
      jobs_by_qn.merge!(new_jobs)
    end
    aggregate_failures(jobs_by_qn.map { |_, job| job.reload })
  end

  def build_answer_grading_jobs(answers_to_grade)
    new_jobs = answers_to_grade.map { |a| [a.question_id, grade_answer(a)] }.
               select { |e| e[1].present? }.to_h # Filter out answers which do not return a job
    wait_for_jobs(new_jobs.values)
    new_jobs
  end

  # Grades the provided answer
  #
  # @param [Course::Assessment::Answer] answer The answer to grade.
  # @return [Course::Assessment::Answer::AutoGradingJob] The job created to grade.
  def grade_answer(answer)
    raise ArgumentError if answer.changed?

    answer.auto_grade!(reduce_priority: true, prevent_regrade: true)
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
    raise SubjobNotCompletedError if jobs.any? { |job| job.status == 'submitted' }
  end

  # Aggregates the failures in the given jobs and fails this job if there were any failures.
  #
  # @param [Array<TrackableJob::Job>] jobs The jobs to aggregate failures for.
  # @raise [StandardError]
  def aggregate_failures(jobs)
    failed_jobs = jobs.select(&:errored?)
    return if failed_jobs.empty?

    error_messages = failed_jobs.map { |job| job.error['message'] }
    raise SubJobError, error_messages.to_sentence
  end

  def unsubmit_answers(submission)
    answers_to_unsubmit = submission.current_answers
    answers_to_unsubmit.each do |answer|
      answer.unsubmit! unless answer.attempting?
    end
  end

  def assign_exp_and_publish_grade(submission)
    submission.points_awarded = Course::Assessment::Submission::CalculateExpService.calculate_exp(submission).to_i
    submission.publish!
  end

  # Gets the ungraded answers for the given submission.
  # When the submission is being graded, the `current_answers` are the ones to grade.
  def ungraded_answers(submission)
    submission.reload.current_answers.select { |a| a.attempting? || a.submitted? }
  end
end
