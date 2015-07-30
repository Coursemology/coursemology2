Rails.application.configure do
  if defined?(Bullet)
    config.after_initialize do
      Bullet.enable = true
      Bullet.rails_logger = true
      Bullet.counter_cache_enable = false
    end
  end
end
