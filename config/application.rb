# frozen_string_literal: true
require_relative 'boot'

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

# Load dotenv only in development environment
Dotenv::Railtie.load if ['development', 'test'].include? ENV['RAILS_ENV']

module Application # rubocop:disable Style/ClassAndModuleChildren
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 6.1
    config.autoloader = :classic

    config.assets.enabled = false

    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration can go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded after loading
    # the framework and any gems in your application.
    # The default locale is :en
    config.i18n.load_path += Dir[Rails.root.join('config', 'locales', '**', '*.yml').to_s]
    # config.i18n.default_locale = :de

    # Action Controller default settings
    config.action_controller.include_all_helpers = false

    # Upgrading into Rails 6.1 causes the issue inside FactoryBot, in which
    # all course-related model got relation with course_assessment_categories in which
    # the way handling it is somewhat changed in this upgrade, and mainly is due to this
    # config being set as true. We probably need to look into the migration files or
    # the has_many and belongs_to relation, but for now we set it false
    # to still comply with the previous, bug-free- version.
    #
    # Default setting is true, and the reference is the following link
    # https://lilyreile.medium.com/rails-6-1-new-framework-defaults-what-they-do-and-how-to-safely-uncomment-them-c546b70f0c5e
    config.active_record.has_many_inversing = false

    # Action Mailer default settings
    config.action_mailer.default_options = { from: ENV['RAILS_MAILER_DEFAULT_FROM_ADDRESS'] }

    config.eager_load_paths << "#{Rails.root}/lib/autoload"
    config.eager_load_paths << "#{Rails.root}/app/models/components"
    config.eager_load_paths << "#{Rails.root}/app/controllers/components"
    config.eager_load_paths << "#{Rails.root}/app/services"
    config.eager_load_paths << "#{Rails.root}/app/services/concerns"
    config.eager_load_paths << "#{Rails.root}/app/notifiers"

    config.action_mailer.delivery_job = 'ActionMailer::MailDeliveryJob'
    config.action_mailer.deliver_later_queue_name = :mailers

    config.x.default_user_time_zone = 'Singapore'
    config.x.public_download_folder = 'downloads'
    config.x.temp_folder = config.root.join('tmp')
  end
end
