# frozen_string_literal: true
class Course::Assessment::Answer::AutoGradingJob < Course::Assessment::Answer::BaseAutoGradingJob
  protected

  # The Answer Auto Grading Job needs to be at a higher priority than submission auto grading jobs,
  # because it is fired off by submission auto grading jobs. If this is at an equal or lower
  # priority than the submission auto grading job, then it is possible that the answer auto grading
  # jobs might never get to run, and then the submission auto grading jobs will never return.
  #
  # Lowering this *will* eventually cause a deadlock.
  #
  # NOTE for is_low_priority flag and :delayed_* queue_as below.
  # For a very specific use case (and as a temporary solution) is_low_priority flag is added to programming question.
  # in order to push grading problem with heavy computation (i.e. 5-10 minutes autograding) to lower priority.
  # This is done to allow all jobs to be run in the main workers,
  # while spinning up other workers that exclude :delayed_* queue
  # to allow other jobs to go through without getting blocked by
  # these delayed_ jobs that would take a very long time to run.
  # Similarly the delayed_ queue is also added for Course::Assessment::Answer::ReducePriorityAutoGradingJob and
  # Course::Assessment::Submission::AutoGradingJob to ensure consistency,
  # and to address job dependencies between submission
  # and answer autograding.
  def default_queue_name
    :highest
  end

  def delayed_queue_name
    :delayed_highest
  end
end
