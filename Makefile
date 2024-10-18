# Variables
DOCKER_COMPOSE = docker-compose
AUTH_COMPOSE = cd authentication && docker-compose
RAILS_ENV = development
POSTGRES_HOST = localhost  # Change this to your specific host

# Targets
.PHONY: help setup build start stop clean test migrate copy-envs auth-start auth-stop

# Default help command
help:
	@echo "Available commands:"
	@echo "  make setup        - Set up the environment and database"
	@echo "  make build        - Build Docker containers"
	@echo "  make start        - Start the backend, client, and auth services"
	@echo "  make stop         - Stop all running services"
	@echo "  make clean        - Stop services and remove containers"
	@echo "  make test         - Run the test suite"
	@echo "  make migrate      - Run database migrations"
	@echo "  make auth-start   - Start the authentication service"
	@echo "  make auth-stop    - Stop the authentication service"
	@echo "  make copy-envs    - Copy env files for client and backend"

# Copy env files for backend and client
copy-envs:
	@echo "Copying env files..."
	cp env .env
	cp client/env client/.env
	cp authentication/env authentication/.env

# Set up the environment (copy envs, bundling gems, Yarn dependencies, etc.)
setup: copy-envs start-postgres start-redis
	@echo "Setting up the environment..."
	psql -h $(POSTGRES_HOST) -U postgres -c 'CREATE DATABASE coursemology;'
	psql -h $(POSTGRES_HOST) -U postgres -c 'CREATE DATABASE coursemology_test;'
	psql -h $(POSTGRES_HOST) -U postgres -c 'CREATE DATABASE coursemology_keycloak;'

# Build Docker containers
build:
	@echo "Building Docker containers..."
	$(DOCKER_COMPOSE) build

# Start the backend, client, and authentication services
start: auth-start backend-start client-start
	@echo "Starting backend, client, and auth services..."
	$(DOCKER_COMPOSE) up --build

# Stop all running services
stop: auth-stop
	@echo "Stopping all services..."
	$(DOCKER_COMPOSE) down

# Stop services and remove containers
clean: stop
	@echo "Removing stopped containers..."
	$(DOCKER_COMPOSE) down --volumes

# Run the test suite after seeding the test database
test: test-seed
	@echo "Running tests..."
	RAILS_ENV=test bundle exec rake test

# Seed the test database
test-seed:
	@echo "Seeding test database..."
	RAILS_ENV=test bundle exec rake coursemology:seed

# Run database migrations
migrate:
	@echo "Running database migrations..."
	bundle exec rake db:migrate

# Start the authentication service using existing docker-compose.yml in authentication folder
auth-start: setup
	@echo "Starting authentication service..."
	$(AUTH_COMPOSE) up -d

# Stop the authentication service using existing docker-compose.yml in authentication folder
auth-stop:
	@echo "Stopping authentication service..."
	$(AUTH_COMPOSE) down

# Start PostgreSQL service
start-postgres:
	@echo "Starting PostgreSQL service..."
	 $(DOCKER_COMPOSE) up -d postgres
	 @echo "Waiting for PostgreSQL to be ready..."
	 sleep 5

# Start Redis service
start-redis:
	@echo "Starting Redis service..."
	$(DOCKER_COMPOSE) up -d redis

# Start the backend service
backend-start: auth-start
	cp env .env
	bundle exec rake db:create
	bundle exec rake db:migrate
	$(DOCKER_COMPOSE) up -d backend

# Start the client service
client-start: backend-start
	cp client/env client/.env
	$(NVM) use 18.17
	cd client && yarn && yarn build:development
	$(DOCKER_COMPOSE) up -d client