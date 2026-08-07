#!/bin/sh
set -e

if [ -z "$APP_KEY" ]; then
    echo "WARNING: APP_KEY is empty. Generate one and set it in the server .env:"
    echo "  docker compose -f docker-compose.prod.yml run --rm php php artisan key:generate --show"
fi

# Wait for MySQL before touching the database
echo "Waiting for database at ${DB_HOST}:${DB_PORT}..."
until php -r "exit(@fsockopen(getenv('DB_HOST'), (int) getenv('DB_PORT')) ? 0 : 1);"; do
    sleep 2
done

php artisan migrate --force

# Warm production caches (config/route/view) for performance
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Generate the OpenAPI/Swagger docs (non-fatal: never crash the app if it fails)
php artisan l5-swagger:generate || true

exec "$@"
