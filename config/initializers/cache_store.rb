# frozen_string_literal: true
Rails.application.configure do
  config.cache_store = :redis_cache_store, {
    host: ENV['REDIS_HOST'],
    port: 6379,
    db: 0,
    password: Rails.application.credentials.dig(:redis, :password),
    namespace: 'cache',
    expires_in: 90.minutes
  }

  config.session_store :redis_store,
                       servers: {
                         host: ENV['REDIS_HOST'],
                         port: 6379,
                         db: 0,
                         password: Rails.application.credentials.dig(:redis, :password),
                         namespace: 'session'
                       },
                       expire_after: 240.minutes
end
