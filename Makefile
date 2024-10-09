SHELL := /bin/zsh

# Loading all context of ~/.zshrc
.SHELLFLAGS := -c '. ~/.zshrc; exec "$$0"'
CURRENT_BRANCH := $(shell git rev-parse --abbrev-ref HEAD)
REMOTE := origin

clean:
	echo "Preparing to setup soft-delete"
	rails generate migration AddDeletedAtToCourseUsers deleted_at:datetime:index
	rails db:migrate
