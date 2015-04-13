# Coursemology, Reloaded [![Build Status](https://travis-ci.org/Coursemology/coursemology2.svg?branch=master)](https://travis-ci.org/Coursemology/coursemology2)
[![Code Climate](https://codeclimate.com/github/Coursemology/coursemology2/badges/gpa.svg)](https://codeclimate.com/github/Coursemology/coursemology2) [![Coverage Status](https://img.shields.io/coveralls/Coursemology/coursemology2.svg)](https://coveralls.io/r/Coursemology/coursemology2) [![Inline docs](http://inch-ci.org/github/Coursemology/coursemology2.svg?branch=master&style=flat-square)](http://inch-ci.org/github/Coursemology/coursemology2)

This is the Rails 4+ re-write of Coursemology.

Major changes:

 1. Rails 4 (from Rails 3.2)
 2. PostgreSQL as default DBMS (from MySQL)
 3. Bootstrap 3.2 (from Bootstrap 2)

## Installation
### System requirements
 - [nodejs](http://nodejs.org) (as a JavaScript runtime for [execjs](https://github.com/sstephenson/execjs))
 - [bundler](http://bundler.io) 1.8.0 or later

### Procedure
 1. Install dependencies using `bundle install`
    1. `bundle install --without development:test` might be preferable for production installs.
    2. `bundle install --without ci:production` might be preferable if you're only intending to
       implement features.
 2. `rake db:setup`. Run `RAILS_ENV=test rake db:setup` too if you are intending to run the test
    suite.
 3. `bin/rails server` to start the development app server. Production installs should configure
    [Puma](http://puma.io) and be reverse-proxied.
 4. You can log in with the default username and password:

    > Email: `test@example.org`
    >
    > Password: `Coursemology!`

## Found Boogs?

Create an issue on the Github [issue tracker](https://github.com/Coursemology/coursemology2/issues).

## License

Copyright (c) 2014 Coursemology.org. This software is licensed under the MIT License.
