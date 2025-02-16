# frozen_string_literal: true

if Rails.env.production?
  require 'sidekiq/api'

  AUTOGRADING_QUEUES = [
    :highest,
    :delayed_highest,
    :medium_high,
    :delayed_medium_high
  ].freeze

  AUTOGRADING_QUEUES_WITHOUT_DELAYED = [
    :highest,
    :medium_high
  ].freeze

  class SidekiqApiService
    def total_grading_queue_size
      AUTOGRADING_QUEUES.map { |queue_name| Sidekiq::Queue.new(queue_name).size }.sum
    end

    def max_grading_queue_latency_seconds
      AUTOGRADING_QUEUES.map { |queue_name| Sidekiq::Queue.new(queue_name).latency }.max
    end

    def total_non_delayed_grading_queue_size
      AUTOGRADING_QUEUES_WITHOUT_DELAYED.map { |queue_name| Sidekiq::Queue.new(queue_name).size }.sum
    end

    def max_non_delayed_grading_queue_latency_seconds
      AUTOGRADING_QUEUES_WITHOUT_DELAYED.map { |queue_name| Sidekiq::Queue.new(queue_name).latency }.max
    end

    def total_threads
      Sidekiq::ProcessSet.new.map { |process| process['concurrency'] }.sum
    end

    def total_busy_threads
      Sidekiq::ProcessSet.new.map { |process| process['busy'] }.sum
    end
  end
else
  class SidekiqApiService
    def total_grading_queue_size
      0
    end

    def max_grading_queue_latency_seconds
      0
    end

    def total_non_delayed_grading_queue_size
      0
    end

    def max_non_delayed_grading_queue_latency_seconds
      0
    end

    def total_threads
      0
    end

    def total_busy_threads
      0
    end
  end
end
