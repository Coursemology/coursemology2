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
  # The ActiveSupport::Notification instrumentation event when a new job is enqueued.
  ENQUEUE_EVENT = 'enqueue.background_thread_adapter.active_job'

  # The ActiveSupport::Notification instrumentation event when the pool grows.
  GROW_EVENT = 'grow.background_thread_adapter.active_job'

  # The ActiveSupport::Notification instrumentation event when the pool shrinks.
  SHRINK_EVENT = 'shrink.background_thread_adapter.active_job'

  # The maximum number of threads to maintain in the thread pool.
  MAX_THREAD_POOL_SIZE = 3

  def initialize
    @future_jobs = []
    @pending_jobs = []
    @running_jobs = 0
    @finish_jobs_condition = ConditionVariable.new
    @thread_pool = []
    @thread_pool_mutex = Mutex.new
    super
  end

  def enqueue(job) #:nodoc:
    ActiveSupport::Notifications.instrument(ENQUEUE_EVENT, job: job, caller: caller) do |payload|
      with_thread_pool { @pending_jobs << job.serialize }
      ensure_threads

      payload.reverse_merge!(notification_statistics)
    end
  end

  def enqueue_at(job, timestamp) #:nodoc:
    @future_jobs << { job: job, at: timestamp }
  end

  # Add all future jobs into the pending jobs queue according to timestamp
  def perform_enqueued_jobs
    @future_jobs.sort_by { |job| -job[:at] }.each { |job| enqueue(job[:job]) }
    clear_enqueued_jobs
  end

  # Clear all the enqueued jobs
  def clear_enqueued_jobs
    @future_jobs.clear
  end

  # Waits for all queued jobs to finish executing.
  def wait_for_jobs
    with_thread_pool do
      return if @pending_jobs.empty? && @running_jobs == 0

      @finish_jobs_condition.wait(@thread_pool_mutex)
    end
  end

  private

  # Executes the block within a thread pool mutex. If the mutex is already owned by the current
  # thread, does nothing (this makes the locking reentrant.)
  #
  # This is needed whenever any of the adapter's class variables are accessed.
  def with_thread_pool(&block)
    if @thread_pool_mutex.owned?
      yield
    else
      @thread_pool_mutex.synchronize(&block)
    end
  end

  # Returns a hash on the statistics of the thread pool. This can be used when logging
  # information about the ActiveJob adapter.
  #
  # This must be called within a +with_thread_pool+ block.
  #
  # @return [Hash]
  def notification_statistics
    {
      pool_size: @thread_pool.size,
      pending_jobs: @pending_jobs.length,
      running_jobs: @running_jobs
    }
  end

  # Ensures that a sufficient number of threads are running to run jobs.
  #
  # This caps the thread pool at +MAX_THREAD_POOL_SIZE+.
  def ensure_threads
    with_thread_pool do
      return if @thread_pool.size >= MAX_THREAD_POOL_SIZE
      return if @pending_jobs.size + @running_jobs < @thread_pool.size

      ActiveSupport::Notifications.instrument(GROW_EVENT) do |payload|
        @thread_pool << new_thread
        payload[:thread] = @thread_pool.last
        payload.reverse_merge!(notification_statistics)
      end
    end
  end

  # Removes a finished thread from the thread pool.
  #
  # This method is idempotent, because terminating a thread should be atomic.
  #
  # @param [Thread] thread_to_remove The thread to remove from the thread pool.
  def remove_thread_from_pool(thread_to_remove)
    with_thread_pool do
      removed_thread = @thread_pool.delete(thread_to_remove)
      next unless removed_thread

      ActiveSupport::Notifications.instrument(SHRINK_EVENT) do |payload|
        payload[:thread] = removed_thread
        payload.reverse_merge!(notification_statistics)
      end
    end
  end

  # Creates a new thread to run queued jobs.
  #
  # @return [Thread]
  def new_thread
    thread = Thread.new(&method(:thread_main))
    thread.abort_on_exception = true
    thread
  end

  # The entry point for all job execution queues.
  #
  # This loops to clear all jobs from the queue, and cleans up the thread from the queue when
  # it exits.
  def thread_main
    loop(&method(:thread_run_pending_jobs))
  ensure
    remove_thread_from_pool(Thread.current)
  end

  # Retrieves jobs from the pool and executes the job, if any.
  #
  # The thread will raise a +StopIteration+ exception when there are no more jobs. It will also
  # remove itself from the thread pool so that a new thread will be spawned when a new job is
  # enqueued. Otherwise, it is possible no thread will be available to run an enqueued job
  # (race condition on creating/destroying threads)
  def thread_run_pending_jobs
    job = nil
    with_thread_pool do
      if (job = @pending_jobs.shift)
        @running_jobs += 1
      else
        remove_thread_from_pool(Thread.current)
        raise StopIteration
      end
    end

    thread_run_job(job)
  end

  # Executes a given job.
  #
  # This will retrieve a database connection, and return it when the job is finished. This will
  # also maintain the current number of jobs running.
  def thread_run_job(job)
    ActiveRecord::Base.connection_pool.with_connection do
      ActiveJob::Base.execute(job)
    end
  ensure
    thread_finish_job(job)
  end

  # Cleans up after a job is finished.
  #
  # This also signals whoever needs to know that the job queue is now empty.
  def thread_finish_job(_)
    with_thread_pool do
      @running_jobs -= 1
      @finish_jobs_condition.broadcast if @running_jobs == 0 && @pending_jobs.empty?
    end
  end

  class LogSubscriber < ActiveSupport::LogSubscriber
    def enqueue(event)
      message = "[Background Thread] Enqueued job: #{event.payload[:job]}, "\
                "call stack:\n#{event.payload[:caller][20..].join("\n")}"
      debug(message)
    end

    def grow(event)
      message = "[Background Thread] New thread: #{event.payload[:thread].object_id}, " +
                pool_statistics(event)
      info(message)
    end

    def shrink(event)
      message = "[Background Thread] Stopping thread: #{event.payload[:thread].object_id}, " +
                pool_statistics(event)
      info(message)
    end

    private

    def logger
      ActiveJob::Base.logger
    end

    def pool_statistics(event)
      "pool size: #{event.payload[:pool_size]}, "\
      "running jobs: #{event.payload[:running_jobs]}, "\
      "pending jobs: #{event.payload[:pending_jobs]}"
    end
  end

  LogSubscriber.attach_to(:'background_thread_adapter.active_job')
end
