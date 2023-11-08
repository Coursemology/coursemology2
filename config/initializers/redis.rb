# frozen_string_literal: true

redis_host = ENV['REDIS_HOST']
redis_port = 6379
redis_password = ENV['REDIS_PASS']

REDIS = Redis.new(host: redis_host, port: redis_port, password: redis_password, db: 0)
