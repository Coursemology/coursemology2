# frozen_string_literal: true
class Course::Assessment::Answer::ReducePriorityAutoGradingJob < Course::Assessment::Answer::BaseAutoGradingJob
  protected

  # The Answer Auto Grading Job needs to be at a higher priority than submission auto grading jobs,
  # because it is fired off by submission auto grading jobs. If this is at an equal or lower
  # priority than the submission auto grading job, then it is possible that the answer auto grading
  # jobs might never get to run, and then the submission auto grading jobs will never return.
  #
  # Lowering this *will* eventually cause a deadlock.
  #
  # Answers are regraded when their question is updated. This causes a large spike in the number
  # of answer auto grading jobs. To prevent active users from getting timely feedback on their
  # answers, queue these regrading jobs at a lower priority than answer grading jobs.
  #
  # NOTE: See Course::Assessment::Answer::AutoGradingJob for comments regarding usage of
  # is_low_priority flag and :delayed_* queue_as below.
  def default_queue_name
    :medium_high
  end

  def delayed_queue_name
    :delayed_medium_high
  end
end
