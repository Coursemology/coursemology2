<!-- markdownlint-disable MD033 MD014 -->

# Coursemology [![CircleCI](https://circleci.com/gh/Coursemology/coursemology2.svg?style=svg)](https://circleci.com/gh/Coursemology/coursemology2)

[![Code Climate](https://codeclimate.com/github/Coursemology/coursemology2/badges/gpa.svg)](https://codeclimate.com/github/Coursemology/coursemology2)
[![codecov](https://codecov.io/gh/Coursemology/coursemology2/branch/master/graph/badge.svg)](https://codecov.io/gh/Coursemology/coursemology2)
[![Inline docs](http://inch-ci.org/github/Coursemology/coursemology2.svg?branch=master&style=flat-square)](http://inch-ci.org/github/Coursemology/coursemology2)
[![Slack](http://coursemology-slack.herokuapp.com/badge.svg)](http://coursemology-slack.herokuapp.com)

<a href="http://coursemology.org"><img src="https://raw.githubusercontent.com/Coursemology/coursemology.org/development/public/images/coursemology_logo_landscape_100.png" alt="Coursemology logo" title="Coursemology" align="right" /></a>

Coursemology is an open source gamified learning platform that enables educators to increase student engagement and make learning fun.

## Setting up Coursemology

### System Requirements

1. Ruby (= 3.0.6)
1. Ruby on Rails (= 6.0.6.1)
1. PostgreSQL (>= 9.5)
1. ImageMagick or GraphicsMagick (For [MiniMagick](https://github.com/minimagick/minimagick) - if PDF processing doesn't work for the import of scribing questions, download Ghostscript)
1. Node.js (v21 LTS)
1. Yarn

Coursemology uses [Ruby on Rails](http://rubyonrails.org/). In addition, some front-end components use [React.js](https://facebook.github.io/react/). This [guide](https://gorails.com/setup/) written by the awesome people at GoRails should help you to get started on Ruby on Rails (however, be careful about the Rails version that you are going to install here. Please refer to the system requirements for the version of Rails you need to have for your system)

### Getting Started

1. We use submodules in the git repo; use this command to update submodules:

   ```sh
   $ git submodule update --init --recursive
   ```

2. Download bundler to install dependencies

   ```sh
   $ gem install bundler:2.2.33
   ```

3. Install ruby dependencies

   ```sh
   $ bundle config set --local without 'ci:production'
   $ bundle install
   ```

4. Install javascript dependencies

   ```sh
   $ cd client && yarn; cd -
   ```

5. Create and seed the database

   ```sh
   $ bundle exec rake db:setup
   ```

6. Bind the IP address `127.0.0.1` to `lvh.me` by running the following command
   ```
   host lvh.me
   ```
7. Open up 2 different terminals, each to run the Frontend and Backend. On the terminal for Frontend, run

   ```
   yarn build:development
   ```

   and on the terminal for Backend, run

   ```
   bundle exec rails s -p 5000
   ```

8. Access the App by visiting `http://lvh.me:8080`

9. You're all set! Simply login with the default username and password:

> Email: `test@example.org`
>
> Password: `Coursemology!`

### Configuration

#### Multi Tenancy

To make sure that multi tenancy works correctly for you, change the default host in `config/application.rb` before deploying:

```ruby
config.x.default_host = 'your_domain.com'
```

#### Opening Reminder Emails

Email reminders for items which are about to start are sent via a cronjob which should be run once an hour. See `config/initializers/sidekiq.rb` and `config/schedule.yml` for sample configuration which assumes that the [Sidekiq](https://github.com/mperham/sidekiq) and [Sidekiq-Cron](https://github.com/ondrejbartas/sidekiq-cron) gems are used.

If you use a different job scheduler, edit those files so your favourite job scheduler invokes the `ConsolidatedItemEmailJob` job once an hour.

## Found Boogs?

Create an issue on the Github [issue tracker](https://github.com/Coursemology/coursemology2/issues) or come talk to us over at our [Slack channels](https://coursemology-slack.herokuapp.com/).

## Contributing

We welcome contributions to Coursemology! Check out the [issue tracker](https://github.com/coursemology/coursemology2/issues) and pick something you'll like to work on. Please read our [Contributor's Guide](https://github.com/Coursemology/coursemology2/blob/master/CONTRIBUTING.md) for guidance on our conventions.

If you are a student from NUS Computing looking for an FYP project, do check with [Prof Ben Leong](http://www.comp.nus.edu.sg/~bleong/).

## License

Copyright (c) 2015-2023 Coursemology.org. This software is licensed under the MIT License.

## Using Coursemology

You're more than welcome to use Coursemology for your own school or organization. If you need more help, [join](http://coursemology-slack.herokuapp.com/) our Slack channel to reach our core developers.

We are actively running [Coursemology](https://coursemology.org) and can provide free use of our infrastructure on a case by case basis. Please contact [Prof Ben Leong](http://www.comp.nus.edu.sg/~bleong/) if you would like to explore this option.

## Acknowledgments

The Coursemology.org Project was made possible by a number of teaching development grants from the National University of Singapore over the years. This project is currently supported by the [AI Centre for Educational Technologies](https://www.aicet.aisingapore.org/).
