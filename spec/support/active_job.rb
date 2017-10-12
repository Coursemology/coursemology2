# frozen_string_literal: true
module ActiveJob::TestGroupHelpers
  def self.with_active_job_queue_adapter_method(adapter = :test)
    proc { |example| ActiveJob::TestGroupHelpers.with_active_job_queue_adapter(example, adapter) }
  end

  def self.with_active_job_queue_adapter(example, adapter)
    old_adapter = ActiveJob::Base.queue_adapter
    ActiveJob::Base.queue_adapter = adapter
    example.call
  ensure
    wait_for_jobs if adapter == :background_thread ||
                     adapter.is_a?(ActiveJob::QueueAdapters::BackgroundThreadAdapter)
    ActiveJob::Base.queue_adapter = old_adapter
  end

  def self.ensure_jobs_completion(example)
    example.call
  ensure
    wait_for_jobs if ActiveJob::Base.queue_adapter.is_a?(ActiveJob::QueueAdapters::BackgroundThreadAdapter)
  end

  def self.wait_for_jobs
    ActiveJob::Base.queue_adapter.wait_for_jobs
  end

  def with_active_job_queue_adapter(adapter, &proc)
    context "with #{adapter} ActiveJob queue adapter" do |*params|
      around(:each, &ActiveJob::TestGroupHelpers.with_active_job_queue_adapter_method(adapter))

      module_exec(*params, &proc)
    end
  end
end

# Since message deliveries use the test delivery engine, all deferred deliver calls must also call
# +deliver_now+ so that the +ActionMailer::Base.deliveries.count+ attribute will also be
# incremented.
module ActionMailer::MessageDelivery::TestDeliveryHelpers
  def deliver_later(_ = {})
    deliver_now
    super
  end

  def deliver_later!(_ = {})
    deliver_now!
    super
  end
end
ActionMailer::MessageDelivery.prepend(ActionMailer::MessageDelivery::TestDeliveryHelpers)

module TrackableJob::SpecHelpers
  def wait_for_job
    if defined?(current_path) && current_path.start_with?(job_path(''))
      job_guid = current_path[(current_path.rindex('/') + 1)..-1]
      job = TrackableJob::Job.find(job_guid)
      job.wait(while_callback: -> { job.reload.submitted? })
      visit current_path
    elsif ActiveJob::Base.queue_adapter.is_a?(ActiveJob::QueueAdapters::BackgroundThreadAdapter)
      ActiveJob::Base.queue_adapter.wait_for_jobs
    end
  end

  def perform_enqueued_jobs
    return unless ActiveJob::Base.queue_adapter.is_a?(ActiveJob::QueueAdapters::BackgroundThreadAdapter)

    ActiveJob::Base.queue_adapter.perform_enqueued_jobs
  end

  def clear_enqueued_jobs
    return unless ActiveJob::Base.queue_adapter.is_a?(ActiveJob::QueueAdapters::BackgroundThreadAdapter)

    ActiveJob::Base.queue_adapter.clear_enqueued_jobs
  end
end

RSpec.configure do |config|
  config.extend ActiveJob::TestGroupHelpers
  config.around(:each, type: :job,
                &ActiveJob::TestGroupHelpers.with_active_job_queue_adapter_method)
  config.around(:each,
                &ActiveJob::TestGroupHelpers.method(:ensure_jobs_completion))
  config.include TrackableJob::SpecHelpers

  config.backtrace_exclusion_patterns << /\/spec\/support\/active_job\.rb/
end
