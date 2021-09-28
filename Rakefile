# frozen_string_literal: true
# Add your own tasks in files placed in lib/tasks ending in .rake,
# for example lib/tasks/capistrano.rake, and they will automatically be available to Rake.

require File.expand_path('config/application', __dir__)

# Development dependencies, may fail. See Gemfile.
begin
  require 'lol_dba'
  require 'traceroute'
rescue LoadError # rubocop:disable Lint/SuppressedException
end

Rails.application.load_tasks
