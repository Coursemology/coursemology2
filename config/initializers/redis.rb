# frozen_string_literal: true

redis_host = ENV['REDIS_HOST']
redis_port = 6379
redis_password = Rails.application.credentials.dig(:redis, :password)

REDIS = Redis.new(host: redis_host, port: redis_port, password: redis_password, db: 0)
