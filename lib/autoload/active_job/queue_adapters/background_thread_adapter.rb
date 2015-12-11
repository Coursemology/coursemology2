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
  class << self
    def enqueue(job) #:nodoc:
      Thread.new do
        ActiveRecord::Base.connection_pool.with_connection do
          ActiveJob::Base.execute(job.serialize)
        end
      end
    end
  end
end
