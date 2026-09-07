# frozen_string_literal: true
# Pushes a submission's task status to Cikgo once the transaction that changed it has committed.
#
# The push is a synchronous HTTP call with a five second timeout, so it is kept off the request: a
# slow or unavailable Cikgo must not delay a response, hold locks on a submission that is already
# saved, or fail a request for work that has been committed.
#
# Unlike the inline +publish_task_completion+, which logs and swallows in production, a failure here
# is allowed to propagate. That is the point of running it as a job: Sidekiq retries it and Rollbar
# records it, rather than the error disappearing into the log.
class Course::Assessment::Submission::PublishTaskCompletionJob < ApplicationJob
  rescue_from(ActiveJob::DeserializationError) do |_|
    # The submission was deleted before the job ran; there is no status left to publish.
  end

  def perform(submission)
    instance = Course.unscoped { submission.assessment.course.instance }

    ActsAsTenant.with_tenant(instance) do
      # Re-read rather than trusting the state at enqueue time. A later transition may already have
      # been pushed, and the status Cikgo should end up with is the current one either way — which
      # also makes two pushes racing each other harmless.
      next unless submission.should_publish_task_completion?

      submission.publish_task_completion!
    end
  end
end
