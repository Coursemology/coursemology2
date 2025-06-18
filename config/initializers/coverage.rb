# frozen_string_literal: true
if Rails.env.test? && ENV['COLLECT_COVERAGE'] == 'true'
  require 'simplecov'
  require 'simplecov-lcov'

  SimpleCov::Formatter::LcovFormatter.config do |c|
    c.report_with_single_file = true
    c.single_report_path = 'coverage/coursemology.lcov'
  end
  SimpleCov.formatter = SimpleCov::Formatter::LcovFormatter

  SimpleCov.start('rails') do
    enable_coverage :branch
    add_filter '/lib/extensions/legacy/active_record/connection_adapters/table_definition.rb'
    add_filter '/lib/tasks/coursemology/stats_setup.rake'
    add_filter '/lib/tasks/coursemology/seed.rake'
    add_filter '/lib/tasks/'
  end
end
