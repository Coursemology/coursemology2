# frozen_string_literal: true
# Two RSpec tags run a spec's jobs through a REAL, Redis-backed Sidekiq processor (perform_later ->
# Redis -> Sidekiq fetch -> server middleware -> job) instead of the custom `:background_thread`
# ActiveJob adapter. They differ ONLY in which thread the processor runs on:
#
# `:sidekiq_same_thread` — processor runs in the TEST thread (synchronous).
#   - RSpec message expectations / mocks work (same thread).
#   - Cannot drive TrackableJob's `#wait` (PostgreSQL LISTEN/NOTIFY): the thread that would emit the
#     NOTIFY is the one blocked waiting for it, so it deadlocks. Run the job, then assert.
#   - Run only the job(s) you enqueue with `perform_sidekiq_jobs { … }` (see Isolation below).
#   - The default for essentially all job specs.
#
#       it 'grades the answer', :sidekiq_same_thread do
#         perform_sidekiq_jobs { AutoGradingJob.perform_later(answer) }
#         expect(answer.reload).to be_graded
#       end
#
# `:sidekiq_separate_thread` — processor runs in a separate WORKER thread (concurrent).
#   - Handles TrackableJob's `#wait` (the job runs concurrently and emits the NOTIFY).
#   - RSpec mocks DO NOT cross the thread boundary — assert on DB state, not on mocks.
#   - Enqueue with `perform_later`; synchronise via the app's own `#wait`.
#
#       it 'waits for the job', :sidekiq_separate_thread do
#         job = SomeTrackableJob.perform_later
#         job.wait
#         expect(job.reload).to be_completed
#       end
#
# Both keep execution in-process (SimpleCov records job coverage) and make a real round-trip through
# Redis (non-serialisable args + real client/server middleware are exercised).
#
# Isolation (`perform_sidekiq_jobs`): processes ONLY the jobs the block enqueues (identified by JID
# via a client middleware) plus any they enqueue, leaving every other queued job untouched — so a
# spec is never polluted by, and never clobbers, setup jobs or a concurrent test's jobs. No global
# `clear!` is used for isolation. See sidekiq_test_migration_plan.md.
require 'sidekiq'
require 'sidekiq/api'
require 'sidekiq/processor'
require 'sidekiq/testing'

module SidekiqTestSupport
  # All queues the app's jobs use (queue_as), plus the delayed_* variants produced dynamically.
  QUEUES = %w[
    highest default delayed_medium_high delayed_high delayed_medium_low delayed_low
    duplication lowest
  ].freeze

  # Sidekiq::Processor REQUIRES a "death handler" block — its run loop calls `@callback.call(self)`
  # / `@callback.call(self, exception)` when it exits. We drive the lifecycle ourselves, so it's a
  # no-op, but it must be present otherwise NoMethodError is raised.
  NOOP_DEATH_HANDLER = ->(*) {}

  # Client middleware: while a tracking array is installed on the current thread, record the JID of
  # each job pushed to Redis. This is how a spec learns exactly which jobs it enqueued.
  class JidTracker
    def call(_job_class, job, _queue, _redis_pool = nil)
      Thread.current[:sidekiq_tracked_jids]&.push(job['jid'])
      yield
    end
  end

  module_function

  def configure!
    @configure ||= begin
      # Configure the default config directly — NOT via `Sidekiq.configure_server`, whose block only
      # runs inside an actual Sidekiq server process (`Sidekiq.server?`), which a spec is not.
      config = Sidekiq.default_configuration
      # Quiet Sidekiq's per-job start/done logging (job_logger uses config.logger).
      config.logger.level = ::Logger::FATAL
      # Record the JID of each job a spec enqueues, so we can run only those (see #perform_tracked).
      config.client_middleware { |chain| chain.add(JidTracker) }
      # The processor fetches only from its capsule's queues — set them explicitly (the memoised
      # default capsule doesn't pick up config.queues after creation).
      config.default_capsule do |cap|
        cap.queues = QUEUES
        cap.concurrency = 1
      end
      true
    end
  end

  def processor
    @processor ||= Sidekiq::Processor.new(Sidekiq.default_configuration.default_capsule, &NOOP_DEATH_HANDLER)
  end

  # --- async (separate-thread) processor, for TrackableJob's LISTEN/NOTIFY ---
  # Runs a real Sidekiq processor in its OWN thread (in-process, so SimpleCov still records job
  # coverage). The job runs concurrently with the test thread, which TrackableJob's `#wait` needs.
  def start_worker!
    @worker = Sidekiq::Processor.new(Sidekiq.default_configuration.default_capsule, &NOOP_DEATH_HANDLER)
    @worker.start
  end

  def stop_worker!
    @worker&.terminate(true)
    @worker = nil
  end

  # Runs the block (which enqueues the spec's job[s]), then processes to completion ONLY those jobs
  # and any they enqueue — identified by JID — leaving every other queued job untouched.
  def perform_tracked(timeout: 15)
    Thread.current[:sidekiq_tracked_jids] = []
    yield
    process_tracked(timeout: timeout)
  ensure
    Thread.current[:sidekiq_tracked_jids] = nil
  end

  def process_tracked(timeout:)
    deadline = Process.clock_gettime(Process::CLOCK_MONOTONIC) + timeout
    loop do
      record = next_tracked_record
      break if record.nil? # no tracked job left in the immediate queues

      if Process.clock_gettime(Process::CLOCK_MONOTONIC) > deadline
        raise "Sidekiq: timed out running tracked jobs #{Thread.current[:sidekiq_tracked_jids].inspect}"
      end

      Thread.current[:sidekiq_tracked_jids].delete(record.jid)
      record.delete
      run_record(record) # may enqueue descendants, which JidTracker adds to the tracked set
    end
  end

  # The first queued job whose JID the current spec enqueued.
  def next_tracked_record
    jids = Thread.current[:sidekiq_tracked_jids]
    return nil if jids.empty?

    QUEUES.each do |name|
      record = Sidekiq::Queue.new(name).find { |job| jids.include?(job.jid) }
      return record if record
    end
    nil
  end

  # Run one specific queued job through the real Sidekiq server middleware + Rails reloader.
  def run_record(record)
    uow = Sidekiq::BasicFetch::UnitOfWork.new(
      "queue:#{record.queue}", record.value, Sidekiq.default_configuration.default_capsule
    )
    processor.send(:process, uow)
  end

  # Clear ONLY Sidekiq's own keys (queues + retry/scheduled/dead sets). Used for coarse cleanup at
  # example boundaries (never mid-example); avoids `flushdb` so unrelated keys sharing the Redis DB
  # (e.g. the app's `REDIS` global) are untouched. Parallel/shared-Redis runs still need a Redis DB
  # per worker.
  def clear!
    QUEUES.each { |name| Sidekiq::Queue.new(name).clear }
    Sidekiq::RetrySet.new.clear
    Sidekiq::ScheduledSet.new.clear
    Sidekiq::DeadSet.new.clear
  end
end

module SidekiqSpecHelpers
  # Runs to completion ONLY the job(s) enqueued within the block (plus any they enqueue), through the
  # real Sidekiq path, in the test thread. Faithful to testing the spec's own job in isolation.
  #
  #   perform_sidekiq_jobs { described_class.perform_later(record) }
  #   expect(record.reload).to be_processed
  def perform_sidekiq_jobs(&block)
    SidekiqTestSupport.perform_tracked(&block)
  end
end

RSpec.configure do |config|
  config.include SidekiqSpecHelpers

  # Synchronous, in-thread — for plain jobs. Isolate with `perform_sidekiq_jobs { … }`.
  config.around(:each, :sidekiq_same_thread) do |example|
    previous_adapter = ActiveJob::Base.queue_adapter
    SidekiqTestSupport.configure!
    Sidekiq::Testing.disable! # real Redis-backed mode
    SidekiqTestSupport.clear!
    ActiveJob::Base.queue_adapter = :sidekiq
    example.run
  ensure
    ActiveJob::Base.queue_adapter = previous_adapter
    SidekiqTestSupport.clear!
  end

  # Async, separate-thread processor — for TrackableJob / LISTEN-NOTIFY (the job runs concurrently
  # while the test `#wait`s). Enqueue with `perform_later`; synchronise via the app's `#wait`.
  config.around(:each, :sidekiq_separate_thread) do |example|
    previous_adapter = ActiveJob::Base.queue_adapter
    SidekiqTestSupport.configure!
    Sidekiq::Testing.disable!
    SidekiqTestSupport.clear!
    ActiveJob::Base.queue_adapter = :sidekiq
    SidekiqTestSupport.start_worker!
    example.run
  ensure
    SidekiqTestSupport.stop_worker!
    ActiveJob::Base.queue_adapter = previous_adapter
    SidekiqTestSupport.clear!
  end
end
