# frozen_string_literal: true
# Simultaneous code coverage reporting to Coveralls and Code Climate.
# Latest version can be found at https://gist.github.com/lowjoel/6c2f2d3a08bb3786994f
require 'simplecov'
require 'simplecov-lcov'

module CoverageHelper
  class << self
    # Helper to include Coveralls/Code Climate coverage, but not require developers to install the
    # gem.
    #
    # @param [String] name The name of the module to require.
    # @yield The block to execute when the module is required successfully.
    def load(name)
      old_formatter = SimpleCov.formatter
      require name
      yield

      merge_formatters(old_formatter, SimpleCov.formatter)
    rescue LoadError => e
      raise e unless e.path == name
      puts format('Cannot find \'%s\', ignoring', name) if ENV['CI']
    end

    private

    # Merge two SimpleCov formatters into a single MultiFormatter.
    #
    # This method is idempotent if the old and new formatters are the same.
    def merge_formatters(old_formatter, new_formatter)
      return if old_formatter == new_formatter

      old_formatter = [*expand_formatter(old_formatter)]
      new_formatter = [*expand_formatter(new_formatter)]
      formatters = old_formatter + new_formatter

      SimpleCov.formatter = SimpleCov::Formatter::MultiFormatter.new(formatters)
    end

    # Extracts the formatters from a MultiFormatter so we do not nest them.
    def expand_formatter(formatter)
      return formatter unless formatter.is_a?(SimpleCov::Formatter::MultiFormatter)
      formatter.formatters
    end
  end
end

if ENV['CI']
  SimpleCov::Formatter::LcovFormatter.report_with_single_file = true
  SimpleCov.formatter = SimpleCov::Formatter::LcovFormatter

  # Coveralls
  CoverageHelper.load('coveralls') do
    Coveralls.wear!('rails')
  end

  # Code coverage exclusions
  SimpleCov.start do
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
