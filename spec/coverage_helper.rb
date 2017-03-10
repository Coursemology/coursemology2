# frozen_string_literal: true
require 'simplecov'

if ENV['CI']
  require 'simplecov-lcov'

  SimpleCov::Formatter::LcovFormatter.report_with_single_file = true
  SimpleCov.formatter = SimpleCov::Formatter::LcovFormatter

  # Code coverage exclusions
  SimpleCov.start('rails') do
    # SimpleCov configuration
    # Helpers for schema migrations. We don't test schema migrations, so these would never run.
    add_filter '/lib/extensions/legacy/active_record/connection_adapters/table_definition.rb'

    # Extra statistics to be placed in `rake stats`. We don't run that on CI, so coverage is not
    # important.
    add_filter '/lib/tasks/coursemology/stats_setup.rake'

    # Rake task to seed dev database with course and assessment data.
    add_filter '/lib/tasks/coursemology/seed.rake'
  end
end
