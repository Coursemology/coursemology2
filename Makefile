NVM = $(HOME)/.nvm/nvm.sh

SHELL := /bin/zsh
.SHELLFLAGS := -i -c
RUBY_VERSION := 3.3.5
RAILS_VERSION := 7.2.1
NODE_VERSION := v18

clean:
	# Bring down the databases
	docker compose down
	# Start the databases, and wait for them to be ready
	docker compose up -d && sleep 5
	# Remove generated files
	find . -name "node_modules" | xargs -I {} rm -rf {}
	# Drop existing databases
	psql -c 'DROP DATABASE IF EXISTS coursemology;'
	psql -c 'DROP DATABASE IF EXISTS coursemology_test;'
	psql -c 'DROP DATABASE IF EXISTS coursemology_keycloak;'
	psql -c 'CREATE DATABASE coursemology;'
	psql -c 'CREATE DATABASE coursemology_test;'
	psql -c 'CREATE DATABASE coursemology_keycloak;'

check-system-requirements:
	@echo "Checking system requirements..."
	@ruby -v | grep -q '$(RUBY_VERSION)' || (echo "Ruby version must be $(RUBY_VERSION)" && exit 1)
	@rails -v | grep -q '$(RAILS_VERSION)' || (echo "Rails version must be $(RAILS_VERSION)" && exit 1)
	@node -v | grep -q '$(NODE_VERSION)' || (echo "Node.js version must be $(NODE_VERSION) LTS" && exit 1)
	@yarn -v || (echo "Yarn must be installed" && exit 1)
	@docker -v || (echo "Docker must be installed" && exit 1)
	@redis-server -v || (echo "Redis must be installed" && exit 1)
	@echo "All system requirements are met."

prepare:
	git submodule update --init --recursive
	gem install bundler:2.5.9
	bundle config set --local without 'ci:production'
	bundle install
	cp env .env
	cp client/env client/.env

authentication-starting:
	cp authentication/env authentication/.env
	cd authentication && docker compose up --build

db-setup:
	bundle exec rake db:setup

client-starting:
	cp client/env client/.env
	$(NVM) use 18.17
	cd client && yarn && yarn build:development

backend-starting:
	cp env .env
	bundle exec rails s -p 3000


