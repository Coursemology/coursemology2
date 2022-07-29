# frozen_string_literal: true
source 'https://rubygems.org'

# For Windows devs
gem 'tzinfo-data', platforms: [:mswin, :mswin64]

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '~> 6.0.5.1'

# Use PostgreSQL for the backend
gem 'pg'

# Instance/Course settings
gem 'settings_on_rails'
# Manage read/unread status
gem 'unread'
# Extension for validating hostnames and domain names
gem 'validates_hostname'
# A Ruby state machine library
gem 'workflow'
gem 'workflow-activerecord', '>= 4.1', '< 7.0'
# Add creator_id and updater_id attributes to models
gem 'activerecord-userstamp', git: 'https://github.com/ekowidianto/activerecord-userstamp.git'
# Allow actions to be deferred until after a record is committed.
gem 'after_commit_action'
# Allow declaring the calculated attributes of a record
gem 'calculated_attributes'
# For multiple table inheritance
# TODO: Figure out breaking changes in v2 as polymorphism is not working correctly.
gem 'active_record-acts_as', git: 'https://github.com/ekowidianto/active_record-acts_as.git', branch: 'rails5.2.3'
# Organise ActiveRecord model into a tree structure
gem 'edge'
# Upsert action for Postgres
gem 'active_record_upsert', '0.11.1'
# Create pretty URLs and work with human-friendly strings
gem 'friendly_id'

# Use SCSS for stylesheets
gem 'sass-rails'
# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '>= 1.3.0'

# TODO: Check compatibility with webpacker 3.2.0 when it is released.
# https://github.com/rails/webpacker/blob/4f65c5ee58666bbe58b234c48d47ec7d48fab4d8/CHANGELOG.md
gem 'webpacker', '<= 5.4.4'
# Internationalisation for JavaScript.
gem 'i18n-js', '<= 4.1.0'

# Routes from JavaScript
gem 'js-routes'

# Use jQuery as the JavaScript library
gem 'jquery-rails'
# Our Coursemology will be themed using Bootstrap
gem 'bootstrap-sass'
gem 'bootstrap-sass-extras', '>= 0.0.7', git: 'https://github.com/doabit/bootstrap-sass-extras'
gem 'autoprefixer-rails'
# Use font-awesome for icons
gem 'font-awesome-rails'
# HTML Pipeline and dependencies
gem 'html-pipeline'
gem 'sanitize', '>= 4.6.3'
gem 'rinku'
gem 'html-pipeline-rouge_filter', git: 'https://github.com/ekowidianto/html-pipeline-rouge_filter.git'
# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder'
# Slim as the templating language
gem 'slim-rails'
# ejs for client-side templates
gem 'ejs'
# High Voltage for static pages
gem 'high_voltage'
# Paginator for Rails
gem 'kaminari'
# Work with Docker
gem 'docker-api'

gem 'recaptcha'
gem 'rexml'

# Page profiler
gem 'rack-mini-profiler'

group :development do
  # Spring speeds up development by keeping your application running in the background.
  # Read more: https://github.com/rails/spring
  gem 'spring', platforms: [:ruby]
  gem 'listen'

  # Gems to make development mode faster and less painful

  gem 'wdm', '>= 0.0.3', platforms: [:mswin, :mswin64]

  # Helps to prevent database slowdowns
  gem 'lol_dba', require: false

  # General cleanliness
  gem 'traceroute', require: false

  # bundle exec yardoc generates the API under doc/.
  # Use yard stats --list-undoc to find what needs documenting.
  gem 'yard', group: :doc

  # Gem to generate favicon
  gem 'rails_real_favicon'
end

group :test do
  gem 'email_spec'
  gem 'rspec-html-matchers'
  gem 'should_not'
  gem 'simplecov'
  gem 'shoulda-matchers'

  # Capybara for feature testing
  gem 'capybara'
  gem 'capybara-selenium'
  gem 'webdrivers'

  gem 'aws-sdk-s3'
  # Make screen shots in tests, helps with the debugging of JavaScript tests.
  gem 'capybara-screenshot'
end

group :development, :test do
  # Use RSpec for Behaviour testing
  gem 'rspec-rails'

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
end

group :ci do
  # Code Coverage reporters
  gem 'codecov', require: false
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

group :production do
  # Use fog-aws as CarrierWave's storage provider
  gem 'fog-aws', '3.8.0'
  gem 'flamegraph'
  gem 'stackprof'
  gem 'sidekiq'
  gem 'sidekiq-cron'
  gem 'sinatra', require: nil
  gem 'redis-rails'
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
gem 'devise', '4.8.1'
gem 'devise_masquerade'
gem 'devise-multi_email'

# NOTE: Facebook login feature is currently disabled.
# gem 'omniauth'
# gem 'omniauth-facebook'

# Use cancancan for authorization
gem 'cancancan'

# Some helpers for structuring CSS/JavaScript
# Official version https://github.com/winston/rails_utils/pull/30 is no longer maintained.
# We also want stricter sanitization.
gem 'rails_utils', git: 'https://github.com/raymondtangsc/rails_utils.git', branch: 'full-sanitize-flash'

# Themes for instances
gem 'themes_on_rails', '>= 0.3.1', git: 'https://github.com/raymondtangsc/themes_on_rails',
                                   branch: 'xtang/rails_6'

# Forms made easy for Rails
gem 'simple_form'
gem 'simple_form-bootstrap', git: 'https://github.com/raymondtangsc/simple_form-bootstrap'
# Dynamic nested forms
gem 'cocoon'
# momentjs-rails is needed for bootstrap3-datetimepicker-rails
gem 'momentjs-rails', git: 'https://github.com/ekowidianto/momentjs-rails.git'
gem 'bootstrap3-datetimepicker-rails'
gem 'bootstrap-select-rails'
gem 'bootstrap_tokenfield_rails'
gem 'twitter-typeahead-rails'
gem 'summernote-rails', git: 'https://github.com/zhuhanming/summernote-rails'

# Using CarrierWave for file uploads
gem 'carrierwave'
# Generate sequential filenames
gem 'filename'
# Required by CarrierWave, for image resizing
gem 'mini_magick'
# Library for reading and writing zip files
gem 'rubyzip', require: 'zip'
# Manipulating XML files, needed for programming evaluation test report parsing.
gem 'nokogiri', '>= 1.8.1'

# Polyglot support
gem 'coursemology-polyglot', git: 'https://github.com/Coursemology/polyglot.git'

# To assist with bulk inserts into database
gem 'activerecord-import', '>= 0.2.0'

gem 'record_tag_helper'
gem 'rails-controller-testing'

# WordNet corpus to obtain lemma form of words, for comprehension questions.
gem 'rwordnet', git: 'https://github.com/makqien/rwordnet'
gem 'loofah', '>= 2.2.1'
gem 'rails-html-sanitizer', '>= 1.0.4'

gem 'sprockets', '< 4.0.0'
gem 'mimemagic', '0.4.3'
gem 'ffi', '>= 1.14.2'
