# frozen_string_literal: true
require 'active_support/core_ext/integer/time'
require "#{Rails.root}/lib/autoload/active_job/queue_adapters/background_thread_adapter"

# The test environment is used exclusively to run your application's
# test suite. You never need to work with it otherwise. Remember that
# your test database is "scratch space" for the test suite and is wiped
# and recreated between test runs. Don't rely on the data there!

Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  config.cache_classes = true

  # Eager load code on boot. This eager loads most of Rails and
  # your application in memory, allowing both threaded web servers
  # and those relying on copy on write to perform better.
  # Rake tasks automatically ignore this option for performance.
  config.eager_load = true

  # Configure public file server for tests with Cache-Control for performance.
  config.public_file_server.enabled = true
  config.public_file_server.headers = {
    'Cache-Control' => "public, max-age=#{1.hour.to_i}"
  }

  # Show full error reports and disable caching.
  config.consider_all_requests_local       = true
  config.action_controller.perform_caching = false
  config.cache_store = :null_store

  # Raise exceptions instead of rendering exception templates.
  config.action_dispatch.show_exceptions = false

  # Disable request forgery protection in test environment.
  config.action_controller.allow_forgery_protection = false

  # Store uploaded files on the local file system in a temporary directory.
  config.active_storage.service = :test

  config.action_mailer.perform_caching = false

  # Tell Action Mailer not to deliver emails to the real world.
  # The :test delivery method accumulates sent emails in the
  # ActionMailer::Base.deliveries array.
  config.action_mailer.delivery_method = :test

  # Default from address for email
  config.action_mailer.default_options = { from: 'coursemology@example.org' }

  # We will assume that we are running on localhost
  config.action_mailer.default_url_options = { host: 'localhost:3200' }

  # Use the threaded background job adapter for replicating the production environment.
  config.active_job.queue_adapter = :background_thread

  # Randomize the order test cases are executed.
  config.active_support.test_order = :random

  # Print deprecation notices to the stderr.
  config.active_support.deprecation = :stderr

  config.x.default_host = 'localhost'
  config.x.client_port = 3200
  config.x.server_port = 7979
  config.x.default_user_password = 'lolololol'
  # Raise exceptions for disallowed deprecations.
  config.active_support.disallowed_deprecation = :raise

  # Tell Active Support which deprecation messages to disallow.
  config.active_support.disallowed_deprecation_warnings = []

  # Raises error for missing translations.
  # config.i18n.raise_on_missing_translations = true

  # Annotate rendered view with file names.
  # config.action_view.annotate_rendered_view_with_filenames = true

  # Rails 6.0.5.1 security patch
  # To find out more unpermitted classes and add below then uncomment
  # yaml_column_permitted_classes. When this is done,
  # config.active_record.use_yaml_unsafe_load can be removed.
  # config.active_record.yaml_column_permitted_classes = [ActiveSupport::HashWithIndifferentAccess,
  #                                                       ActiveSupport::Duration]
  config.active_record.use_yaml_unsafe_load = true

  config.middleware.insert_before 0, Rack::Cors do
    allow do
      origins(/localhost:([0-9]+)/, /(.*?)\.localhost:([0-9]+)/)
      resource '*', headers: :any, methods: [:get, :post, :patch, :put], credentials: true
    end
  end

  config.factory_bot.reject_primary_key_attributes = false
end
