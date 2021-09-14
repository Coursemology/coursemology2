# frozen_string_literal: true
require_relative 'boot'

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Application # rubocop:disable Style/ClassAndModuleChildren
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 5.1

    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration can go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded after loading
    # the framework and any gems in your application.
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

    config.action_mailer.delivery_job = 'ActionMailer::MailDeliveryJob'

    config.x.default_user_time_zone = 'Singapore'
    config.x.public_download_folder = 'downloads'
    config.x.temp_folder = config.root.join('tmp')
  end
end
