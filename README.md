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

1. **Ruby** (= 3.3.5)
2. **Ruby on Rails** (= 7.2.3.1)
3. **PostgreSQL** (= 16) with **PGVector extension**
4. **ImageMagick** or **GraphicsMagick** (For [MiniMagick](https://github.com/minimagick/minimagick) - if PDF processing doesn't work for the import of scribing questions, download **Ghostscript**)
5. **Node.js** (v22 LTS)
6. **Yarn**
7. **Docker** (installed and running)
8. **Redis**

### Getting Started

We use Git submodules. Run the following command to initialize them before proceeding:

   ```sh
   $ git submodule update --init --recursive
   ```

Coursemology consists of three main components:
1. [Keycloak authentication provider](./authentication/README.md)
2. [Ruby on Rails application server](./app/README.md)
3. [React frontend client](./client/README.md)

Set up and run each component sequentially by following the linked documentation pages. As you proceed, open a new terminal window for each component after the previous component has been fully set up and started running.

Once each component has been set up and is running on their own terminals, you can access the app by visiting [http://localhost:8080](http://localhost:8080), and log in using the default user email and password:

email: `test@example.org`
password: `Coursemology!`

### Running using HTTPS locally

These commands should be run from the repository root directory, unless otherwise noted.

`lvh.me` is a public domain that resolves to `127.0.0.1`. It is used instead of `localhost` because browsers enforce stricter security policies on `localhost` that can break the OAuth redirect flow over HTTPS.

1. Generate a self-signed certificate and key for `lvh.me`:

   ```sh
   openssl req -x509 -newkey rsa:4096 -sha256 -days 365 -nodes \
     -keyout config/credentials/server.key \
     -out config/credentials/server.crt \
     -subj "/CN=lvh.me" \
     -addext "subjectAltName=DNS:lvh.me,DNS:*.lvh.me"
   ```

   Puma and the webpack dev server both use these files automatically on startup.

2. Update the Keycloak redirect URIs to use HTTPS:

   ```sh
   bundle exec rake "keycloak:push_redirect_uris[https://lvh.me:8080]"
   ```

3. Start the app server with the public hostname:

   ```sh
   RAILS_HOSTNAME=lvh.me:8080 RAILS_ENV=development bundle exec puma
   ```

4. Start the client in HTTPS mode (from the `client/` directory):

   ```sh
   yarn build:development-https
   ```

Access the app at `https://lvh.me:8080`. Your browser will show a certificate warning for the self-signed cert — ignore it or add a security exception.

#### Reverting to HTTP

1. Remove the certificate files so Puma falls back to HTTP:

   ```sh
   rm config/credentials/server.crt config/credentials/server.key
   ```

2. Restore the Keycloak redirect URIs:

   ```sh
   bundle exec rake "keycloak:push_redirect_uris"
   ```

3. Restart both the app server and client using the standard commands.


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
