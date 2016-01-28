# frozen_string_literal: true
# == Active Job Background Thread adapter
#
# When enqueueing jobs with the Background Thread adapter the job will be executed in a
# background thread. This is a good balance between the hassle of setting up a full backend
# and having some asynchrony.
#
# To use the Inline set the queue_adapter config to +:background_thread+.
#
#   Rails.application.config.active_job.queue_adapter = :background_thread
class ActiveJob::QueueAdapters::BackgroundThreadAdapter < ActiveJob::QueueAdapters::InlineAdapter
  # The ActiveSupport::Notification instrumentation event when the pool grows.
  GROW_EVENT = 'grow.background_thread_adapter.active_job'.freeze

  # The ActiveSupport::Notification instrumentation event when the pool shrinks.
  SHRINK_EVENT = 'shrink.background_thread_adapter.active_job'.freeze

  # The maximum number of threads to maintain in the thread pool.
  MAX_THREAD_POOL_SIZE = 3

  @pending_jobs = []
  @thread_pool = []
  @thread_pool_mutex = Mutex.new

  def self.enqueue(job) #:nodoc:
    with_thread_pool { @pending_jobs << job }
    ensure_threads
  end

  class << self
    private

    def with_thread_pool(&block)
      @thread_pool_mutex.synchronize(&block)
    end

    def ensure_threads
      with_thread_pool do
        return if @thread_pool.size >= MAX_THREAD_POOL_SIZE
        return if @pending_jobs.size < @thread_pool.size

        ActiveSupport::Notifications.instrument(GROW_EVENT) do |payload|
          @thread_pool << new_thread
          payload[:thread] = @thread_pool.last
          payload[:pool_size] = @thread_pool.size
        end
      end
    end

    def remove_thread_from_pool(thread_to_remove)
      with_thread_pool do
        ActiveSupport::Notifications.instrument(SHRINK_EVENT) do |payload|
          @thread_pool.delete(thread_to_remove)
          payload[:thread] = thread_to_remove
          payload[:pool_size] = @thread_pool.size
        end
      end
    end

    def new_thread
      thread = Thread.new(&method(:thread_main))
      thread.abort_on_exception = true
      thread
    end

    def thread_main
      job = nil
      loop do
        with_thread_pool { job = @pending_jobs.shift }
        return unless job

        ActiveRecord::Base.connection_pool.with_connection do
          ActiveJob::Base.execute(job.serialize)
        end
      end
    ensure
      remove_thread_from_pool(Thread.current)
    end
  end

  class LogSubscriber < ActiveSupport::LogSubscriber
    def grow(event)
      message = "[Background Thread] New thread: #{event.payload[:thread].object_id}, "\
                "pool size: #{event.payload[:pool_size]}"
      info(message)
    end

    def shrink(event)
      message = "[Background Thread] Stopping thread: #{event.payload[:thread].object_id}, "\
                "pool size: #{event.payload[:pool_size]}"
      info(message)
    end

    private

    def logger
      ActiveJob::Base.logger
    end
  end

  LogSubscriber.attach_to(:'background_thread_adapter.active_job')
end
