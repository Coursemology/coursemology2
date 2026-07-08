# frozen_string_literal: true
# Set Redis storage for Rack Mini Profiler.
# https://github.com/MiniProfiler/rack-mini-profiler#storage

Rack::MiniProfiler.config.storage_options = {
  host: ENV['REDIS_HOST'],
  password: Rails.application.credentials.dig(:redis, :password)
}
Rack::MiniProfiler.config.storage = Rack::MiniProfiler::RedisStore
