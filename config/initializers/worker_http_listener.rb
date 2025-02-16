# frozen_string_literal: true

# Start a HTTP listener on worker containers to capture AWS SQS events
# (e.g. health check, or jobs configured in cron.yaml EB configuration)

if Rails.env.production? && !ENV['IS_RAILS_WORKER'].nil?
  require './app/services/sidekiq_api_service'
  SIDEKIQ_API_SERVICE = SidekiqApiService.new
  HTTP_LISTENER_PORT = 8080

  def metric_payload(name, timestamp, value, unit)
    {
      metric_name: name,
      timestamp: timestamp,
      value: value,
      unit: unit,
      # Valid values are 1 (high resolution, 3 hours retention),
      # and 60 (low resolution, 15 days retention)
      storage_resolution: 60
    }
  end

  def push_metrics
    metric_timestamp = Time.now.utc.beginning_of_minute
    CLOUDWATCH_CLIENT.put_metric_data({
      namespace: 'Sidekiq',
      metric_data: [
        metric_payload('GradingQueueSize', metric_timestamp, SIDEKIQ_API_SERVICE.total_grading_queue_size, 'None'),
        metric_payload('GradingQueueLatencySeconds', metric_timestamp,
                       SIDEKIQ_API_SERVICE.max_grading_queue_latency_seconds, 'Seconds'),
        metric_payload('NonDelayedGradingQueueSize', metric_timestamp,
                       SIDEKIQ_API_SERVICE.total_non_delayed_grading_queue_size, 'None'),
        metric_payload('NonDelayedGradingQueueLatencySeconds', metric_timestamp,
                       SIDEKIQ_API_SERVICE.max_non_delayed_grading_queue_latency_seconds, 'Seconds'),
        metric_payload('TotalThreads', metric_timestamp, SIDEKIQ_API_SERVICE.total_threads, 'None'),
        metric_payload('BusyThreads', metric_timestamp, SIDEKIQ_API_SERVICE.total_busy_threads, 'None')
      ]
    })
  end

  Thread.new do
    logger = Logger.new($stdout)
    socket = TCPServer.new('0.0.0.0', HTTP_LISTENER_PORT)
    logger.info("worker HTTP listener started on port #{HTTP_LISTENER_PORT}")
    begin
      loop do
        client = begin
          socket.accept
        rescue StandardError
          nil
        end
        next unless client

        first_line = client.gets
        _verb, path = first_line&.split || []

        if path == '/push_metrics'
          begin
            push_metrics
            # status code must be 200 to prevent retries
            client.puts("HTTP/1.1 200\n\n")
          rescue StandardError => e
            logger.error(e)
            client.puts("HTTP/1.1 500\n\nInternal Server Error")
          end
        else
          # capture other requests as existing health check for backward compatibility
          # check redis connection
          begin
            Sidekiq.redis(&:info)
            client.puts("HTTP/1.1 200\n\n")
          rescue StandardError => e
            logger.error(e)
            client.puts("HTTP/1.1 500\n\nInternal Server Error")
          end
        end

        begin
          client.close
        rescue StandardError
          nil
        end
      end
    ensure
      logger.info('worker HTTP listener shutting down...')
      begin
        socket.close
      rescue StandardError
        nil
      end
    end
  end
end
