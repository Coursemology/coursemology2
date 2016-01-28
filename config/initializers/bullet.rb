# frozen_string_literal: true
Rails.application.configure do
  if defined?(Bullet)
    config.after_initialize do
      Bullet.enable = true
      Bullet.rails_logger = true
      Bullet.counter_cache_enable = false
    end
  else
    config.after_initialize do
      ApplicationController.class_eval do
        def without_bullet
          yield
        end
      end
    end
  end
end
