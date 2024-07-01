# frozen_string_literal: true
source 'https://rubygems.org'

ruby '3.1.4'

# For Windows devs
gem 'tzinfo-data', platforms: [:mswin, :mswin64]

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '~> 6.1.7.7'

# Use PostgreSQL for the backend
gem 'pg'

# Enables CORS configuration to allow sharing resources with client on another domain
gem 'rack-cors'

# Instance/Course settings
gem 'settings_on_rails', git: 'https://github.com/bivanalhar/settings_on_rails'
# Manage read/unread status
gem 'unread'
# Extension for validating hostnames and domain names
gem 'validates_hostname'
# A Ruby state machine library
gem 'workflow'
gem 'workflow-activerecord', '>= 4.1', '< 7.0'
# Add creator_id and updater_id attributes to models
gem 'activerecord-userstamp', git: 'https://github.com/Coursemology/activerecord-userstamp.git',
                              branch: 'bivan/upgrade-rails-7-ruby-3'
# Allow actions to be deferred until after a record is committed.
gem 'after_commit_action'
# Allow declaring the calculated attributes of a record
gem 'calculated_attributes', git: 'https://github.com/aha-app/calculated_attributes',
                             ref: 'af4e503a3a739501c6e74d6ac7690e8c84349b86'
# For multiple table inheritance
# TODO: Figure out breaking changes in v2 as polymorphism is not working correctly.
gem 'active_record-acts_as', git: 'https://github.com/Coursemology/active_record-acts_as.git',
                             branch: 'bivan/support-rails-7-ruby-3'
# Organise ActiveRecord model into a tree structure
gem 'edge'
# Upsert action for Postgres
gem 'active_record_upsert', '0.11.2'
# Create pretty URLs and work with human-friendly strings
gem 'friendly_id'

# HTML Pipeline and dependencies
gem 'html-pipeline'
gem 'sanitize', '>= 4.6.3'
gem 'rinku'
gem 'rouge', '~> 3'
gem 'ruby-oembed'

# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder'
# Slim as the templating language
gem 'slim-rails'
# Paginator for Rails
gem 'kaminari'
# Work with Docker
gem 'docker-api'

gem 'recaptcha'
gem 'rexml'

# Page profiler
gem 'rack-mini-profiler'

gem 'redis-rails'

group :development do
  # Spring speeds up development by keeping your application running in the background.
  # Read more: https://github.com/rails/spring
  gem 'spring', platforms: [:ruby]
  gem 'listen'

  # Helps to prevent database slowdowns
  gem 'lol_dba', require: false

  # General cleanliness
  gem 'traceroute', require: false

  # bundle exec yardoc generates the API under doc/.
  # Use yard stats --list-undoc to find what needs documenting.
  gem 'yard', group: :doc
end

group :test do
  gem 'email_spec'
  gem 'rspec-html-matchers'
  gem 'should_not'
  gem 'shoulda-matchers'

  # Capybara for feature testing
  gem 'capybara'
  gem 'capybara-selenium'

  # Make screen shots in tests, helps with the debugging of JavaScript tests.
  gem 'capybara-screenshot'
end

group :development, :test do
  # Use RSpec for Behaviour testing
  gem 'rspec-rails'

  gem 'rubocop', '~> 1.64'

  # Factory Bot for factories
  gem 'factory_bot_rails'

  # Checks that all translations are used and defined
  gem 'i18n-tasks', require: false

  # Helps to prevent database consistency mistakes
  gem 'consistency_fail', require: false

  # Prevent N+1 queries.
  gem 'bullet', '>= 4.14.9'

  gem 'parallel_tests'

  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'byebug', platform: :mri

  # Code Coverage reporters
  gem 'simplecov'
  gem 'codecov', require: false

  gem 'dotenv-rails'
end

group :ci do
  gem 'rspec-retry'
  gem 'rspec_junit_formatter'
  gem 'rubocop-rails'
end

# This is used only when producing Production assets. Deals with things like minifying JavaScript
# source files/image assets.
group :assets do
  # Compress image assets
  gem 'image_optim_rails'
end

group :production, :test do
  # Puma will be our app server
  gem 'puma'
end

group :production, :ci do
  gem 'aws-sdk-s3'
end

group :production do
  # Use fog-aws as CarrierWave's storage provider
  gem 'fog-aws', '3.22.0'
  gem 'flamegraph'
  gem 'stackprof'
  gem 'sidekiq'
  gem 'sidekiq-cron'
  gem 'rollbar', '>= 1.5.3'

  # better log format
  gem 'lograge'
  gem 'lograge-sql'
end

# Multitenancy
gem 'acts_as_tenant'

# Internationalization
gem 'http_accept_language'

# User authentication
gem 'devise', '4.9.4'
gem 'devise-multi_email'
gem 'keycloak'
gem 'jwt'

# Use cancancan for authorization
gem 'cancancan'

# Some helpers for structuring CSS/JavaScript
# Official version https://github.com/winston/rails_utils/pull/30 is no longer maintained.
# We also want stricter sanitization.
gem 'rails_utils', git: 'https://github.com/Coursemology/rails_utils.git',
                   branch: 'bivan/upgrade-rails-7-ruby-3'

# Using CarrierWave for file uploads
gem 'carrierwave', '2.2.6'
# Generate sequential filenames
gem 'filename'
# Required by CarrierWave, for image resizing
gem 'mini_magick'
# Library for reading and writing zip files
gem 'rubyzip', require: 'zip'
# Manipulating XML files, needed for programming evaluation test report parsing.
gem 'nokogiri', '>= 1.8.1'

# Polyglot support
gem 'coursemology-polyglot', '0.3.8'

# To assist with bulk inserts into database
gem 'activerecord-import', '>= 0.2.0'

gem 'record_tag_helper'
gem 'rails-controller-testing'

# WordNet corpus to obtain lemma form of words, for comprehension questions.
gem 'rwordnet', git: 'https://github.com/Coursemology/rwordnet'
gem 'loofah', '>= 2.2.1'
gem 'rails-html-sanitizer', '>= 1.0.4'

gem 'mimemagic', '0.4.3'
gem 'ffi', '>= 1.14.2'
