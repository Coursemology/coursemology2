# frozen_string_literal: true
Rails.application.configure do
  # Store sessions in Rails.cache (Redis in production — configured in
  # config/environments/production.rb), using Rails' built-in ActionDispatch::Session::CacheStore.
  # This replaces the redis-actionpack `:redis_store` store so the redis-rails gem family can be
  # dropped while keeping sessions server-side on Redis.
  #
  # NOTE: this is the *production* session store. config/initializers/session_store.rb overrides it
  # with :cookie_store in development/test, and is removed from the deployment image
  # (so :cache_store is the effective store in production).
  config.session_store :cache_store,
                       key: '_coursemology2_session',
                       same_site: :lax,
                       expire_after: 240.minutes
end
