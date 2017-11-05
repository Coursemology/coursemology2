# frozen_string_literal: true
require File.expand_path('../boot', __FILE__)

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

class Application < Rails::Application
  config.load_defaults 5.1
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
  config.action_mailer.default_options = { from: ENV['RAILS_MAILER_DEFAULT_FROM_ADDRESS'] }

  config.eager_load_paths << "#{Rails.root}/lib/autoload"
  config.eager_load_paths << "#{Rails.root}/app/models/components"
  config.eager_load_paths << "#{Rails.root}/app/controllers/components"
  config.eager_load_paths << "#{Rails.root}/app/services"
  config.eager_load_paths << "#{Rails.root}/app/services/concerns"
  config.eager_load_paths << "#{Rails.root}/app/notifiers"

  config.x.default_host = 'example.org'
  config.x.default_user_time_zone = 'Singapore'
  config.x.public_download_folder = 'downloads'
  config.x.temp_folder = config.root.join('tmp')
end
