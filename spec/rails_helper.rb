# frozen_string_literal: true
# This file is copied to spec/ when you run 'rails generate rspec:install'
ENV['RAILS_ENV'] ||= 'test'

require 'spec_helper'
require 'rspec/rails'
# Add additional requires below this line. Rails is not loaded until this point!
require 'shoulda/matchers'
require 'cancan/matchers'
require 'active_record/acts_as/matchers'

# Requires supporting ruby files with custom matchers and macros, etc, in
# spec/support/ and its subdirectories. Files matching `spec/**/*_spec.rb` are
# run as spec files by default. This means that files in spec/support that end
# in _spec.rb will both be required and run as specs, causing the specs to be
# run twice. It is recommended that you do not name files matching this glob to
# end with _spec.rb. You can configure this pattern with the --pattern
# option on the command line or in ~/.rspec, .rspec or `.rspec-local`.
#
# The following line is provided for convenience purposes. It has the downside
# of increasing the boot-up time by auto-requiring all files in the support
# directory. Alternatively, in the individual `*_spec.rb` files, manually
# require only the support files necessary.
#
Dir[Rails.root.join('spec/support/**/*.rb')].each { |f| require f }

# Checks for pending migrations before tests are run.
# If you are not using ActiveRecord, you can remove this line.
ActiveRecord::Migration.maintain_test_schema!

# Ensure that all database seeds are in the database.
Application.load_tasks
Rake::Task['db:seed'].invoke

RSpec.configure do |config|
  # Remove this line if you're not using ActiveRecord or ActiveRecord fixtures
  config.fixture_path = "#{::Rails.root}/spec/fixtures"
  config.file_fixture_path = "#{::Rails.root}/spec/fixtures"

  # If you're not using ActiveRecord, or you'd prefer not to run each of your
  # examples within a transaction, remove the following line or assign false
  # instead of true.
  config.use_transactional_fixtures = false

  # RSpec Rails can automatically mix in different behaviours to your tests
  # based on their file location, for example enabling you to call `get` and
  # `post` in specs under `spec/controllers`.
  #
  # You can disable this behaviour by removing the line below, and instead
  # explicitly tag your specs with their type, e.g.:
  #
  #     RSpec.describe UsersController, :type => :controller do
  #       # ...
  #     end
  #
  # The different available types are documented in the features, such as in
  # https://relishapp.com/rspec/rspec-rails/docs
  config.infer_spec_type_from_file_location!

  # Old school have_tag, with_tag(and more) matchers for rspec 3
  config.include RSpecHtmlMatchers

  # Upload Capybara screenshots to S3 in CI
  if ENV['CI']
    Capybara::Screenshot.s3_configuration = {
      s3_client_credentials: {
        access_key_id: ENV['CAPYBARA_SCREENSHOT_ACCESS_KEY_ID'],
        secret_access_key: ENV['CAPYBARA_SCREENSHOT_SECRET_ACCESS_KEY'],
        region: ENV['CAPYBARA_SCREENSHOT_REGION']
      },
      bucket_name: ENV['CAPYBARA_SCREENSHOT_BUCKET_NAME']
    }

    Capybara::Screenshot.s3_object_configuration = {
      acl: 'public-read'
    }

    Capybara::Screenshot.prune_strategy = { keep: 10 }
  end
end
