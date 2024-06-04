# Coursemology ID Authentication

We are now using [Keycloak](https://www.keycloak.org/) as our Identity and Access Management (IAM) solution.

## Installation Guide

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

To ensure the smoothness in signing-in to Coursemology, you must ensure that the configuration for `KEYCLOAK_BE_CLIENT_SECRET` inside `.env` matches with the settings inside Keycloak. To do so, you can simply do the following instructions:

1. Sign-in to authentication pages by inputting the following credentials:

> Username: `admin` (whatever defined in KEYCLOAK_ADMIN inside ./.env)
>
> Password: `password` (whatever defined in KEYCLOAK_ADMIN_PASSWORD inside ./.env)

2. Navigate to coursemology realm by choosing Coursemology in the top-left dropdown box, or simply access Coursemology [realm](http://localhost:8443/admin/master/console/#/coursemology)

3. Navigate to Client, then click on the Client ID in which name is `coursemology-backend`

4. Over there, navigate to Credentials and you will see the Client Secret. If whatever is defined there does not match with the Client Secret defined in your environment setup, simply copy-paste the client secret inside the page (you can possibly regenerate it if you want), then copy-paste it to `KEYCLOAK_BE_CLIENT_SECRET` inside `../.env`

5. Finally, your Keycloak setup for Coursemology is finished and you are safe to proceed to the next step inside the Coursemology setup guide.
