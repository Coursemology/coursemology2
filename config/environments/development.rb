# frozen_string_literal: true
require 'active_support/core_ext/integer/time'

Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  # In the development environment your application's code is reloaded any time
  # it changes. This slows down response time but is perfect for development
  # since you don't have to restart the web server when you make code changes.
  config.cache_classes = false

  # Do not eager load code on boot.
  config.eager_load = false

  # Show full error reports.
  config.consider_all_requests_local = true

  # Enable/disable caching. By default caching is disabled.
  # Run rails dev:cache to toggle caching.
  if Rails.root.join('tmp', 'caching-dev.txt').exist?
    config.action_controller.perform_caching = true
    config.action_controller.enable_fragment_cache_logging = true

    config.cache_store = :memory_store
    config.public_file_server.headers = {
      'Cache-Control' => "public, max-age=#{2.days.to_i}"
    }
  else
    config.action_controller.perform_caching = false

    config.cache_store = :null_store
  end

  # Store uploaded files on the local file system (see config/storage.yml for options).
  config.active_storage.service = :local

  # Don't care if the mailer can't send.
  config.action_mailer.raise_delivery_errors = false

  config.action_mailer.perform_caching = false

  # Print deprecation notices to the Rails logger.
  config.active_support.deprecation = :log

  # Raise exceptions for disallowed deprecations.
  config.active_support.disallowed_deprecation = :log

  # Tell Active Support which deprecation messages to disallow.
  config.active_support.disallowed_deprecation_warnings = []

  # Raise an error on page load if there are pending migrations.
  config.active_record.migration_error = :page_load

  # Highlight code that triggered database queries in logs.
  config.active_record.verbose_query_logs = true

  # Raises error for missing translations.
  # config.i18n.raise_on_missing_translations = true

  # Annotate rendered view with file names.
  # config.action_view.annotate_rendered_view_with_filenames = true

  # Use an evented file watcher to asynchronously detect changes in source code,
  # routes, locales, etc. This feature depends on the listen gem.
  config.file_watcher = ActiveSupport::EventedFileUpdateChecker

  config.x.default_app_host = 'lvh.me'
  config.x.default_host = "#{config.x.default_app_host}:5000"
  # Uncomment if you wish to allow Action Cable access from any origin.
  # config.action_cable.disable_request_forgery_protection = true

  config.action_mailer.default_url_options = { host: "#{config.x.default_app_host}:5000" }

  # Rails 6.0.5.1 security patch
  # To find out more unpermitted classes and add below then uncomment
  # yaml_column_permitted_classes. When this is done,
  # config.active_record.use_yaml_unsafe_load can be removed.
  # config.active_record.yaml_column_permitted_classes = [ActiveSupport::HashWithIndifferentAccess,
  #                                                       ActiveSupport::Duration]
  config.active_record.use_yaml_unsafe_load = true

  config.action_mailer.delivery_method = :smtp
  config.action_mailer.smtp_settings = { address: '127.0.0.1', port: 1025 }
  config.action_mailer.raise_delivery_errors = false

  config.action_cable.disable_request_forgery_protection = true

  config.action_dispatch.default_headers = {
    'X-Frame-Options' => 'ALLOWALL'
  }

  config.hosts << ".#{config.x.default_app_host}"

  config.middleware.insert_before 0, Rack::Cors do
    allow do
      origins(/lvh\.me:([0-9]+)/, /(.*?)\.lvh\.me:([0-9]+)/)
      resource '*', headers: :any, methods: [:get, :post, :patch, :put], credentials: true
    end
  end
end
