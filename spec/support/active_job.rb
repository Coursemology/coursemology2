module ActiveJob::TestGroupHelpers
  def self.with_active_job_queue_adapter_method(adapter = :test)
    proc { |example| ActiveJob::TestGroupHelpers.with_active_job_queue_adapter(example, adapter) }
  end

  def self.with_active_job_queue_adapter(example, adapter)
    old_adapter = ActiveJob::Base.queue_adapter
    ActiveJob::Base.queue_adapter = adapter
    example.call
  ensure
    ActiveJob::Base.queue_adapter = old_adapter
  end

  def with_active_job_queue_adapter(adapter, &proc)
    context "with #{adapter} ActiveJob queue adapter" do |*params|
      around(:each, &ActiveJob::TestGroupHelpers.with_active_job_queue_adapter_method(adapter))

      module_exec(*params, &proc)
    end
  end
end

# Since message deliveries use the test delivery engine, all deferred deliver calls must be
# converted to +deliver_now+ to prevent a dependency on the ActiveJob queue adapter.
module ActionMailer::MessageDelivery::TestDeliveryHelpers
  def deliver_later(_ = {})
    deliver_now
  end

  def deliver_later!(_ = {})
    deliver_now!
  end
end
ActionMailer::MessageDelivery.prepend(ActionMailer::MessageDelivery::TestDeliveryHelpers)

RSpec.configure do |config|
  config.extend ActiveJob::TestGroupHelpers
  config.around(:each, type: :job,
                &ActiveJob::TestGroupHelpers.with_active_job_queue_adapter_method)

  config.backtrace_exclusion_patterns << /\/spec\/support\/active_job\.rb/
end
