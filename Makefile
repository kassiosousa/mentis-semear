.PHONY: help up down build logs restart shell-php shell-node migrate fresh test

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

up: ## Start the whole stack
	docker compose up -d

build: ## Rebuild images
	docker compose build

down: ## Stop the stack
	docker compose down

restart: ## Restart the stack
	docker compose restart

logs: ## Tail logs
	docker compose logs -f

shell-php: ## Shell into the PHP container
	docker compose exec php sh

shell-node: ## Shell into the frontend container
	docker compose exec frontend sh

migrate: ## Run Laravel migrations
	docker compose exec php php artisan migrate

fresh: ## Drop & re-run migrations
	docker compose exec php php artisan migrate:fresh

test: ## Run backend tests
	docker compose exec php php artisan test
