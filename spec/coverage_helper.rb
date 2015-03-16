require 'simplecov'

module CoverageHelper
  class << self
    # Helper to include Coveralls/Code Climate coverage, but not require developers to install the
    # gem.
    #
    # @param name [String] The name of the module to require.
    # @param initializer [Proc] The block to execute when the module is required successfully.
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
      return unless old_formatter == new_formatter

      formatters.unshift(SimpleCov.formatter)
      SimpleCov.formatter = SimpleCov::Formatter::MultiFormatter[*formatters]
    end

    # Tracks the formatters which need to be enabled
    #
    # @return [Array] The formatters which have been currently defined.
    def formatters
      @formatters ||= []
    end
  end
end

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
  # Helpers for schema migrations. We don't test schema migrations, so these would never run.
  add_filter '/lib/extensions/active_record/connection_adapters/table_definition.rb'
end
