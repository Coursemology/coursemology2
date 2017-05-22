# Coursemology [![Build Status](https://travis-ci.org/Coursemology/coursemology2.svg?branch=master)](https://travis-ci.org/Coursemology/coursemology2)
[![Code Climate](https://codeclimate.com/github/Coursemology/coursemology2/badges/gpa.svg)](https://codeclimate.com/github/Coursemology/coursemology2)
[![codecov](https://codecov.io/gh/Coursemology/coursemology2/branch/master/graph/badge.svg)](https://codecov.io/gh/Coursemology/coursemology2)
[![Security](https://hakiri.io/github/Coursemology/coursemology2/master.svg)](https://hakiri.io/github/Coursemology/coursemology2/master) 
[![Inline docs](http://inch-ci.org/github/Coursemology/coursemology2.svg?branch=master&style=flat-square)](http://inch-ci.org/github/Coursemology/coursemology2)
[![Slack](http://coursemology-slack.herokuapp.com/badge.svg)](http://coursemology-slack.herokuapp.com)

<a href="http://coursemology.org"><img src="https://raw.githubusercontent.com/Coursemology/coursemology.org/development/public/images/coursemology_logo_landscape_100.png"
 alt="Coursemology logo" title="Coursemology" align="right" /></a>

Coursemology is an open source gamified learning platform that enables
educators to increase student engagement and make learning fun.

## Setting up Coursemology

### System Requirements

1. Ruby (>= 2.3.1)
2. Ruby on Rails
3. PostgreSQL
4. ImageMagick or GraphicsMagick (For [MiniMagick](https://github.com/minimagick/minimagick))
5. Node.js
6. Yarn

Coursemology uses [Ruby on Rails](http://rubyonrails.org/).
In addition, some front-end components use
[React.js](https://facebook.github.io/react/).
This [guide](https://gorails.com/setup/) written by the awesome people at
GoRails should help you to get started on Ruby on Rails.

### For Windows Setup Only

 1. Set up Ubuntu Bash by following the instructions [here](http://www.windowscentral.com/how-install-bash-shell-command-line-windows-10).

 2. Setup the aforementioned System Requirements on your Ubuntu bash. Subsequently, follow the steps in 'Getting Started' to finish your setup.

 3. If you wish to setup the evaluator, you will need to install Docker on Ubuntu Bash and Docker for Windows ([here](https://docs.docker.com/docker-for-windows/)), and then connect them via TCP. On Ubuntu Bash:

    ~~~ sh
    cd
    wget https://get.docker.com/builds/Linux/x86_64/docker-17.04.0-ce.tgz
    tar -xzvf docker-*.tgz
    cd docker
    ./docker -H tcp://0.0.0.0:2375 ps
    ~~~

    or 

    ~~~ sh
    env DOCKER_HOST=tcp://0.0.0.0:2375 ./docker ps
    ~~~
    
    To make it permanent:

    ~~~ sh
    mkdir ~/bin
    mv ~/docker/docker ~/bin
    ~~~

    Add the corresponding variables to .bashrc

    ~~~ sh
    export DOCKER_HOST=tcp://0.0.0.0:2375
    export PATH=$PATH:~/bin
    ~~~

    For more information, you can refer to the original [post](https://serverfault.com/questions/767994/can-you-run-docker-natively-on-the-new-windows-10-ubuntu-bash-userspace).

### Getting Started

 1. We use submodules in the git repo; use this command to update submodules:  
    ~~~ sh
    git submodule update --init --recursive
    ~~~

 2. Download bundler to install dependencies

    ~~~ sh
    $ gem install bundler
    ~~~

 3. Install ruby dependencies

    ~~~ sh
    $ bundle install --without ci:production
    ~~~

 4. Install javascript dependencies

    ~~~ sh
    $ cd client && yarn; cd -
    ~~~

 5. Create and seed the database

    ~~~ sh
    $ bundle exec rake db:setup
    ~~~

 6. Start [webpack](https://webpack.github.io/) and the development app server

    ~~~ sh
    $ foreman start
    ~~~
    Or if you are not using foreman:
    ~~~sh
    # Start the webpack dev server:
    $ cd client && yarn build:development

    # Run this command to compile the assets before running the test suite.
    $ cd client && yarn build:test
    ~~~

 7. You're all set! Simply login with the default username and password:

> Email: `test@example.org`
>
> Password: `Coursemology!`

### Configuration

  To make sure that multi tenancy works correctly for you, change the default host in
  `config/application.rb` before deploying:
  ~~~ ruby
  config.x.default_host = 'your_domain.com'
  ~~~

## Found Boogs?

Create an issue on the Github [issue tracker](https://github.com/Coursemology/coursemology2/issues) or come talk to us over at our [Slack channels](https://coursemology-slack.herokuapp.com/).

## Contributing

We welcome contributions to Coursemology!
Check out the [issue tracker](https://github.com/coursemology/coursemology2/issues) and pick
something you'll like to work on.
Please read our
[Contributor's Guide](https://github.com/Coursemology/coursemology2/blob/master/CONTRIBUTING.md)
for guidance on our conventions.

If you are a student from NUS Computing looking for an FYP project, do check with
[Prof Ben Leong](http://www.comp.nus.edu.sg/~bleong/).

## License

Copyright (c) 2015-2017 Coursemology.org. This software is licensed under the MIT License.

## Using Coursemology

You're more than welcome to use Coursemology for your own school or organization.
If you need more help, [join](http://coursemology-slack.herokuapp.com/) our Slack channel
to reach our core developers.

We are actively running Coursemology in beta and can provide free use of our infrastructure
on a case by case basis. Please contact [Prof Ben Leong](http://www.comp.nus.edu.sg/~bleong/)
if you would like to explore this option.

## Acknowledgments

The Coursemology.org Project was made possible by a number of teaching development grants from the National University of Singapore over the years.
