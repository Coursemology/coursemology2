source 'https://rubygems.org'
source 'https://rails-assets.org'

# For Windows devs
gem 'tzinfo-data', platforms: [:mswin, :mswin64]

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '~> 4.1.8'

# Use PostgreSQL for the backend
gem 'pg'
# Schema Plus for some higher level database abstractions
gem 'schema_plus', '~> 1'
gem 'schema_validations'
# Table and column comments
gem 'migration_comments'
# Add creator_id and updater_id attributes to models
gem 'magiclabs-userstamp', github: 'lowjoel/userstamp'
# Squeel as an SQL-like DSL
gem 'squeel'

# Use SCSS for stylesheets
gem 'sass-rails', '~> 4.0.3'
# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '>= 1.3.0'

# Use jQuery as the JavaScript library
gem 'jquery-cdn'
gem 'rails-assets-jquery-ujs'
# Our Coursemology will be themed using Bootstrap
gem 'bootstrap-sass'
gem 'bootstrap-sass-extras'
gem 'autoprefixer-rails'
# Use font-awesome for icons
gem 'font-awesome-rails'
# Turbolinks makes following links in your web application faster.
# Read more: https://github.com/rails/turbolinks
gem 'turbolinks'
# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '~> 2.0'
# Slim as the templating language
gem 'slim-rails'
# High Voltage for static pages
gem 'high_voltage'
# Paginator for Rails
gem 'kaminari'

group :development do
  # Spring speeds up development by keeping your application running in the background.
  # Read more: https://github.com/rails/spring
  gem 'spring'
  gem 'listen', '~> 1.3.1'

  # Gems to make development mode faster and less painful
  gem 'rails-dev-tweaks'
  gem 'rails-dev-boost', github: 'thedarkone/rails-dev-boost'
  gem 'rails-flog', require: 'flog'
  gem 'wdm', '>= 0.0.3', platforms: [:mswin, :mswin64]

  # Helps to prevent database slowdowns
  gem 'lol_dba'
  gem 'bullet'

  # General cleanliness
  gem 'traceroute'
end

group :development, :test do
  # bundle exec yardoc generates the API under doc/.
  # Use yard stats --list-undoc to find what needs documenting.
  gem 'yard',                  group: :doc

  # Use RSpec for Behaviour testing
  gem 'rspec-rails'
  gem 'rspec-html-matchers'
  gem 'should_not'
  gem 'simplecov'
  gem 'shoulda-matchers'

  # Capybara for feature testing
  gem 'capybara'

  # Factory Girl for factories
  gem 'factory_girl_rails'

  # Helps to prevent database consistency mistakes
  gem 'consistency_fail'
end

group :ci do
  # Code Coverage reporters
  gem 'coveralls'
  gem 'codeclimate-test-reporter'
end

group :production do
  # Puma will be our app server.
  gem 'puma'
end

# Multitenancy
gem 'acts_as_tenant'

# Extension for validating hostnames and domain names
gem 'validates_hostname'

# Internationalization
gem 'http_accept_language'

# User authentication
gem 'devise'

# Use cancancan for authorization
gem 'cancancan', '~> 1.9'

# Some helpers for structuring CSS/JavaScript
gem 'rails_utils', '~> 3.3', '>= 3.3.2'

# Themes for instances
gem 'themes_on_rails', github: 'lowjoel/themes_on_rails'

# Forms made easy for Rails
gem 'simple_form'
gem 'simple_form-bootstrap'
gem 'momentjs-rails', '>= 2.8.1'
gem 'bootstrap3-datetimepicker-rails'
gem 'bootstrap-select-rails'

# Use Capistrano for deployment
# gem 'capistrano-rails', group: :development
