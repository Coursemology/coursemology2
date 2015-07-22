require File.expand_path('../boot', __FILE__)

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

class Application < Rails::Application
  # Settings in config/environments/* take precedence over those specified here.
  # Application configuration should go into files in config/initializers
  # -- all .rb files in that directory are automatically loaded.

  # Set Time.zone default to the specified zone and make Active Record auto-convert to this zone.
  # Run "rake -D time" for a list of tasks for finding time zone names. Default is UTC.
  # config.time_zone = 'Central Time (US & Canada)'

  # The default locale is :en
  config.i18n.load_path += Dir[Rails.root.join('config', 'locales', '**', '*.yml').to_s]
  # config.i18n.default_locale = :de

  # Action Controller default settings
  config.action_controller.include_all_helpers = false

  # Action Mailer default settings
  config.action_mailer.default_options = { from: ENV['EMAIL_FROM_ADDRESS'] }

  # Do not swallow errors in after_commit/after_rollback callbacks.
  config.active_record.raise_in_transactional_callbacks = true

  config.eager_load_paths << "#{Rails.root}/lib/autoload"
  config.eager_load_paths << "#{Rails.root}/app/models/components"
  config.eager_load_paths << "#{Rails.root}/app/controllers/components"
  config.eager_load_paths << "#{Rails.root}/app/services"
  config.eager_load_paths << "#{Rails.root}/app/notifiers"
end
