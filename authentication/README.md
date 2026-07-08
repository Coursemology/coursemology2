# Coursemology Authentication Provider

We are now using [Keycloak](https://www.keycloak.org/) as our Identity and Access Management (IAM) solution.

## Installation Guide

### Getting Started

These commands should be run with the working directory `coursemology2/authentication` (the same directory this README file is in)

1. Make sure you have docker and also docker-compose installed.

2. Run the following command

   ```
   docker build -t coursemology_auth .
   ```

3. Run the following command to initialize `.env` files over here

   ```
   cp env .env
   ```

4. Create an empty coursemology_keycloak database in postgresql by running the following command

   ```
   psql -c "CREATE DATABASE coursemology_keycloak;" -d postgres
   ```

5. From a terminal, enter the following command to start Keycloak:

   ```
   docker compose up
   ```

   If the above does not work (happened sometimes), you can instead opt to run the following command:

   ```
   docker-compose up
   ```

6. The authentication pages can be accessed via `http://localhost:8443/admin`

## Further Guide

The local setup requires the authentication provider container to connect to the postgres service running on the host machine. On Windows and Mac, this is already set up by Docker Desktop, which lets the container do this by accessing the `host.docker.internal` hostname. On Linux devices, this can be set up by either:
- installing [Docker Desktop for Linux](https://docs.docker.com/desktop/setup/install/linux/); **or**
- changing the `KC_NETWORK_MODE` environment variable to `host`, and adding the following to the docker-compose service declaration:

  ```yaml
  
  services:
    coursemology_auth:
      container_name: coursemology_authentication
        ...
        extra_hosts:
        - 'host.docker.internal:127.0.0.1'

  ```

For certain operations within Coursemology (such as adding/editing instances), you must ensure that the client_secret defined in the Rails credentials matches with the settings inside Keycloak. To do so, you can simply do the following instructions:

1. Sign-in to the Keycloak admin authentication page

> Username: `admin` (defined in `KEYCLOAK_ADMIN` inside ./.env)
>
> Password: `password` (defined in `KEYCLOAK_ADMIN_PASSWORD` inside ./.env)

2. Navigate to [the Coursemology realm](http://localhost:8443/admin/master/console/#/coursemology), or by choosing `coursemology` in the top-left dropdown box

3. Navigate to Clients, then click on the Client ID named `coursemology-backend`

4. Navigate to Credentials and you will see the Client Secret. Regenerate it if necessary.

Following the instructions in the [Rails credentials config](../config/credentials/README.md), copy-paste the client secret in the appropriate section:
```yaml
...
keycloak:
  ...
  backend:
    client_id: <value from Keycloak configuration>
    client_secret: <value from Keycloak configuration>
...
```

5. Finally, your Keycloak setup for Coursemology is finished and you are safe to proceed to the next step inside the Coursemology setup guide.
