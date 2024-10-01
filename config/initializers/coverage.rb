# frozen_string_literal: true
if Rails.env.test? && ENV['COLLECT_COVERAGE'] == 'true'
  require 'simplecov'
  require 'simplecov-cobertura'

  SimpleCov.formatter = SimpleCov::Formatter::CoberturaFormatter

  SimpleCov.start('rails') do
    add_filter '/lib/extensions/legacy/active_record/connection_adapters/table_definition.rb'
    add_filter '/lib/tasks/coursemology/stats_setup.rake'
    add_filter '/lib/tasks/coursemology/seed.rake'
    add_filter '/lib/tasks/'
  end
end
