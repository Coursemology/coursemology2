require 'simplecov'

module CoverageHelper
  # Helper to include Coveralls/Code Climate coverage, but not require developers to install the gem.
  #
  # @param name [String] The name of the module to require.
  # @param initialiser [Proc] The block to execute when the module is required successfully.
  def self.load(name, &initialiser)
    old_simplecov_formatter = SimpleCov.formatter
    require name
    initialiser.call

    if old_simplecov_formatter != SimpleCov.formatter
      formatters.unshift(SimpleCov.formatter)
      SimpleCov.formatter = SimpleCov::Formatter::MultiFormatter[*formatters]
    end
  rescue LoadError => e
    if e.path == name
      puts 'Cannot find \'%s\', ignoring' % [name] if ENV['CI']
    else
      raise e
    end
  end

  private

  # Tracks the formatters which need to be enabled
  #
  # @return [Array] The formatters which have been currently defined.
  def self.formatters
    @formatters ||= []
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
