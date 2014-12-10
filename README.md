# Coursemology, Reloaded [![Build Status](https://travis-ci.org/Coursemology/coursemology2.svg?branch=master)](https://travis-ci.org/Coursemology/coursemology2) [![Code Climate](https://codeclimate.com/github/Coursemology/coursemology2/badges/gpa.svg)](https://codeclimate.com/github/Coursemology/coursemology2) [![Coverage Status](https://img.shields.io/coveralls/Coursemology/coursemology2.svg)](https://coveralls.io/r/Coursemology/coursemology2)

This is the Rails 4.1 re-write of Coursemology.

Major changes:

 1. Rails 4 (from Rails 3.2)
 2. PostgreSQL as default DBMS (from MySQL)
 3. Bootstrap 3.2 (from Bootstrap 2)

## Installation
### System requirements
 - [nodejs](http://nodejs.org) (as a JavaScript runtime for [execjs](https://github.com/sstephenson/execjs))

### Procedure
 1. Install dependencies using `bundle install`
    1. `bundle install --without development:test` might be preferable for production installs.
    2. `bundle install --without ci:production` might be preferable if you're only intending to
       implement features.
 2. `rake db:load`. Run `RAILS_ENV=test rake db:load` too if you are intending to run the test
    suite.
 3. `bin/rails server` to start the development app server. Production installs should configure
    [Puma](http://puma.io) and be reverse-proxied.

## Development
Code styles are predefined in the RubyMine/IntelliJ project files. Also, the
[Rails Community Style Guide](https://github.com/bbatsov/ruby-style-guide) covers majority of the
styles that we use.

Run tests using `rake spec`.

