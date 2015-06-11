# Simultaneous code coverage reporting to Coveralls and Code Climate.
# Latest version can be found at https://gist.github.com/lowjoel/6c2f2d3a08bb3786994f
require 'simplecov'

module CoverageHelper
  class << self
    # Helper to include Coveralls/Code Climate coverage, but not require developers to install the
    # gem.
    #
    # @param [String] name The name of the module to require.
    # @param [Proc] initializer The block to execute when the module is required successfully.
    def load(name, &initializer)
      old_formatter = SimpleCov.formatter
      require name
      initializer.call

      merge_formatters(old_formatter, SimpleCov.formatter)
    rescue LoadError => e
      if e.path == name
        puts format('Cannot find \'%s\', ignoring', name) if ENV['CI']
      else
        raise e
      end
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

      SimpleCov.formatter = SimpleCov::Formatter::MultiFormatter[*formatters]
    end

    # Extracts the formatters from a MultiFormatter so we do not nest them.
    def expand_formatter(formatter)
      return formatter unless formatter.is_a?(SimpleCov::Formatter::MultiFormatter)
      formatter.formatters
    end
  end
end

if ENV['CI']
  # Coveralls
  CoverageHelper.load('coveralls') do
    Coveralls.wear!('rails')
  end

  # Code Climate
  CoverageHelper.load('codeclimate-test-reporter') do
    CodeClimate::TestReporter.start
  end

  # Code coverage exclusions
  SimpleCov.start do
    # SimpleCov configuration
    # Helpers for schema migrations. We don't test schema migrations, so these would never run.
    add_filter '/lib/extensions/legacy/active_record/connection_adapters/table_definition.rb'
  end
end
