# Coursemology ID Authentication

We are now using [Keycloak](https://www.keycloak.org/) as our Identity and Access Management (IAM) solution.

## Installation Guide

1. Make sure you have docker installed.
2. Go to /authentication and run
   ```
   docker build -t coursemology_auth .
   ```
3. Create and/or update .env file using template from env file in /auth, /client and root directories.
4. Create an empty coursemology_keycloak database in postgresql
5. From a terminal, enter the following command to start Keycloak:
   ```
   docker compose up
   ```
6. The authentication pages can be accessed via `http://localhost:8443/admin`
