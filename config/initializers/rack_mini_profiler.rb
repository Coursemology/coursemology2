# frozen_string_literal: true

Rack::MiniProfiler.config.position = 'top-right'

if Rails.env.production?
  Rack::MiniProfiler.config.storage_options = { host: ENV['REDIS_HOST'], password: ENV['REDIS_PASS'] }
  Rack::MiniProfiler.config.storage = Rack::MiniProfiler::RedisStore
end
