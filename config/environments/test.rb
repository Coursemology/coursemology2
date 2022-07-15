# frozen_string_literal: true
# The test environment is used exclusively to run your application's
# test suite. You never need to work with it otherwise. Remember that
# your test database is "scratch space" for the test suite and is wiped
# and recreated between test runs. Don't rely on the data there!

Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  config.cache_classes = true

  # Do not eager load code on boot. This avoids loading your whole application
  # just for the purpose of running a single test. If you are using a tool that
  # preloads Rails for running tests, you may have to set it to true.
  # NOTE: set it to false would result in CI tests to timeout
  config.eager_load = true

  # Configure public file server for tests with Cache-Control for performance.
  config.public_file_server.enabled = true
  config.public_file_server.headers = { 'Cache-Control' => 'public, max-age=3600' }

  # Show full error reports and disable caching.
  config.consider_all_requests_local       = true
  config.action_controller.perform_caching = false

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
  config.action_mailer.default_url_options = { host: 'localhost' }

  # Use the threaded background job adapter for replicating the production environment.
  config.active_job.queue_adapter = ActiveJob::QueueAdapters::BackgroundThreadAdapter.new

  # Randomize the order test cases are executed.
  config.active_support.test_order = :random

  # Print deprecation notices to the stderr.
  config.active_support.deprecation = :stderr

  config.x.default_host = 'coursemology.lvh.me'

  # Raises error for missing translations.
  # config.action_view.raise_on_missing_translations = true

  # Rails 6.0.5.1 security patch
  # To find out more unpermitted classes and add below then uncomment
  # yaml_column_permitted_classes. When this is done,
  # config.active_record.use_yaml_unsafe_load can be removed.
  # config.active_record.yaml_column_permitted_classes = [ActiveSupport::HashWithIndifferentAccess,
  #                                                       ActiveSupport::Duration]
  config.active_record.use_yaml_unsafe_load = true
end
