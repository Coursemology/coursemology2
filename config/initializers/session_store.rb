# frozen_string_literal: true

# Be sure to restart your server when you modify this file.

if Rails.env.production?
  Rails.application.config.session_store :redis_store, servers: { host: ENV['REDIS_HOST'],
                                                                  port: 6379,
                                                                  db: 0,
                                                                  password: ENV['REDIS_PASS'],
                                                                  namespace: 'session' },
                                                       expire_after: 240.minutes
else
  Rails.application.config.session_store :cookie_store, key: '_coursemology2_session',
                                                        same_site: :strict
end
