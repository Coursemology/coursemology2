# Playwright Tests

## Running the Tests

First, make sure the test database is seeded before running any specs:

```bash
RAILS_ENV=test bundle exec rake db:setup
```

Then, make sure the [authentication server](../authentication/README.md) is running.


Then, start the test Rails server with
```bash
RAILS_ENV=test bundle exec rails s -p 7979
```


In a separate terminal, start the server from *the root directory* with

```bash
DCR_CLIENT_PORT=3200 DCR_SERVER_PORT=7979 DCR_PUBLIC_PATH='/static' DCR_ASSETS_DIR='./client/build' node path/to/dirt-cheap-rocket.cjs
```

Now you can run the playwright tests.

```bash
yarn test
```
