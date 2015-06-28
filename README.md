# Coursemology [![Build Status](https://travis-ci.org/Coursemology/coursemology2.svg?branch=master)](https://travis-ci.org/Coursemology/coursemology2)
[![Code Climate](https://codeclimate.com/github/Coursemology/coursemology2/badges/gpa.svg)](https://codeclimate.com/github/Coursemology/coursemology2) [![Coverage Status](https://img.shields.io/coveralls/Coursemology/coursemology2.svg)](https://coveralls.io/r/Coursemology/coursemology2) [![Inline docs](http://inch-ci.org/github/Coursemology/coursemology2.svg?branch=master&style=flat-square)](http://inch-ci.org/github/Coursemology/coursemology2)
[![Slack](http://coursemology-slack.herokuapp.com/badge.svg)](http://coursemology-slack.herokuapp.com)

<a href="http://coursemology.org"><img src="https://raw.githubusercontent.com/Coursemology/coursemology.org/development/public/images/coursemology_logo_landscape_100.png"
 alt="Coursemology logo" title="Coursemology" align="right" /></a>

Coursemology is an open source gamified learning platform that enables
educators to increase student engagement and make learning fun.

## Setting up Coursemology

### System Requirements

1. Ruby (>= 2.1.0)
2. Ruby on Rails
3. PostgreSQL

Coursemology uses [Ruby on Rails](http://rubyonrails.org/). This
[guide](https://gorails.com/setup/) written by the awesome people at
GoRails should help you to get everything started.

### Getting Started

 1. Download bundler to install dependencies

    ~~~ sh
    $ gem install bundler
    ~~~

 2. Install dependencies

    ~~~ sh
    $ bundle install --without ci:production
    ~~~

 3. Create and seed the database

    ~~~ sh
    $ bundle exec rake db:setup
    ~~~

 4. Start the development app server

    ~~~ sh
    $ bundle exec rails server
    ~~~

 5. You're all set! Simply login with the default username and password:

> Email: `test@example.org`
>
> Password: `Coursemology!`

## Found Boogs?

Create an issue on the Github [issue tracker](https://github.com/Coursemology/coursemology2/issues) or come talk to us over at our [Slack channels](https://coursemology-slack.herokuapp.com/).

## License

Copyright (c) 2015 Coursemology.org. This software is licensed under the MIT License.
