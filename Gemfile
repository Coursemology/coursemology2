# frozen_string_literal: true
source 'https://rubygems.org'

# For Windows devs
gem 'tzinfo-data', platforms: [:mswin, :mswin64]

# Lock down Bundle version as new versions will cause noisy
# changes in the Gemfile.lock file
gem 'bundler', '>= 1.10.3'

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
# We need a patched version of rails because stock 5.1.6 has_one associations ignores
# joins in scope, which we use for Course::LessonPlan::Item.default_reference_time
gem 'rails', '5.1.6', git: 'https://github.com/Coursemology/rails.git',
                      branch: 'v5.1.6-fix_association_with_scope_including_joins'

# Use PostgreSQL for the backend
gem 'pg'

# Schema Plus for some higher level database abstractions
gem 'schema_plus_columns'
gem 'schema_plus_indexes'
gem 'schema_plus_pg_indexes'
gem 'schema_validations'
# Instance/Course settings
gem 'settings_on_rails'
# Manage read/unread status
gem 'unread'
# Extension for validating hostnames and domain names
gem 'validates_hostname'
# A Ruby state machine library
gem 'workflow'
# Add creator_id and updater_id attributes to models
gem 'activerecord-userstamp', git: 'https://github.com/lowjoel/activerecord-userstamp'
# Allow actions to be deferred until after a record is committed.
gem 'after_commit_action'
# Allow declaring the calculated attributes of a record
gem 'calculated_attributes'
# Baby Squeel as an SQL-like DSL
gem 'baby_squeel'
# For multiple table inheritance
#   TODO: Figure out breaking changes in v2 as polymorphism is not working correctly.
gem 'active_record-acts_as', git: 'https://github.com/Coursemology/active_record-acts_as', branch: 'rails5'
# Organise ActiveRecord model into a tree structure
gem 'edge'
# Upsert action for Postgres
gem 'active_record_upsert'
# Create pretty URLs and work with human-friendly strings
gem 'friendly_id'

# Use SCSS for stylesheets
gem 'sass-rails'
# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '>= 1.3.0'

# TODO: Check compatibility with webpacker 3.2.0 when it is released.
# https://github.com/rails/webpacker/blob/4f65c5ee58666bbe58b234c48d47ec7d48fab4d8/CHANGELOG.md
gem 'webpacker', '<= 3.5.6'
# Internationalisation for JavaScript.
gem 'i18n-js', '>= 3.0.0.rc1'

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
gem 'html-pipeline-rouge_filter'
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

group :development do
  # Spring speeds up development by keeping your application running in the background.
  # Read more: https://github.com/rails/spring
  gem 'spring', platforms: [:ruby]
  gem 'listen', '~> 3.1.5'

  # Gems to make development mode faster and less painful
  gem 'rails-flog', require: 'flog'
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
  gem 'chromedriver-helper'

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
  gem 'codecov', :require => false
  gem 'rspec-retry'
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

# Multitenancy
gem 'acts_as_tenant'

# Internationalization
gem 'http_accept_language'

# User authentication
gem 'devise'
gem 'devise_masquerade'
gem 'devise-multi_email'

gem 'omniauth'
gem 'omniauth-facebook'

# Use cancancan for authorization
gem 'cancancan'
gem 'cancancan-baby_squeel'

# Some helpers for structuring CSS/JavaScript
gem 'rails_utils', '>= 3.3.3'

# Themes for instances
gem 'themes_on_rails', '>= 0.3.1', git: 'https://github.com/Coursemology/themes_on_rails',
                                   branch: 'cache-theme-templates'

# Forms made easy for Rails
gem 'simple_form'
gem 'simple_form-bootstrap', git: 'https://github.com/Coursemology/simple_form-bootstrap'
# Dynamic nested forms
gem 'cocoon'
gem 'bootstrap3-datetimepicker-rails'
gem 'bootstrap-select-rails'
gem 'bootstrap_tokenfield_rails'
gem 'twitter-typeahead-rails'
gem 'summernote-rails'

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
gem 'coursemology-polyglot', git: 'https://github.com/Coursemology/polyglot'

# To assist with bulk inserts into database
gem 'activerecord-import', '>= 0.2.0'

# Use Capistrano for deployment
# gem 'capistrano-rails', group: :development

gem 'record_tag_helper'
gem 'rails-controller-testing'

# WordNet corpus to obtain lemma form of words, for comprehension questions.
gem 'rwordnet', git: 'https://github.com/makqien/rwordnet'
gem 'loofah', '>= 2.2.1'
gem 'rails-html-sanitizer', '>= 1.0.4'
