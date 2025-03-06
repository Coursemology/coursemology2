# Coursemology App Server

Coursemology uses [Ruby on Rails](http://rubyonrails.org/) as its backend app server. This [guide](https://gorails.com/setup/) written by the awesome people at GoRails should help you to get started on Ruby on Rails (however, be careful about the Rails version you are going to install here, and make sure your system meets its requirements).

## Getting Started

These commands should be run with the repository root directory (one level up from where this README file is) as the working directory.

1. Download bundler to install dependencies

   ```sh
   gem install bundler:2.5.9
   ```

2. Install ruby dependencies

   ```sh
   bundle config set --local without 'ci:production'
   bundle install
   ```

3. Create and seed the database

   ```sh
   bundle exec rake db:setup
   ```

4. Initialize .env file

   ```sh
   cp env .env
   ```

   You may need to add specific API keys (such as the [GOOGLE_RECAPTCHA_SITE_KEY](https://developers.google.com/recaptcha/docs/faq#id-like-to-run-automated-tests-with-recaptcha.-what-should-i-do)) to the .env files for testing specific features.

5. To start the app server, run

   ```
   bundle exec rails s -p 3000
   ```

## Configuration

### Multi Tenancy

To make sure that multi tenancy works correctly for you, change the default host in `config/application.rb` before deploying:

```ruby
config.x.default_host = 'your_domain.com'
```

### Opening Reminder Emails

Email reminders for items which are about to start are sent via a cronjob which should be run once an hour. See [config/initializers/sidekiq.rb](../config/initializers/sidekiq.rb) and [config/schedule.yml](../config/schedule.yml) for sample configuration which assumes that the [Sidekiq](https://github.com/mperham/sidekiq) and [Sidekiq-Cron](https://github.com/ondrejbartas/sidekiq-cron) gems are used.

If you use a different job scheduler, edit those files so your favourite job scheduler invokes the `ConsolidatedItemEmailJob` job once an hour.