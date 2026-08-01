#!/bin/sh
set -e

# Install PHP dependencies if they are not present (first boot / fresh volume).
# Check for autoload.php rather than the dir: the named volume mounts an empty
# vendor/ directory, so a plain -d test would wrongly skip the install.
if [ ! -f vendor/autoload.php ]; then
    composer install --no-interaction --prefer-dist --no-progress
fi

# Ensure an .env exists (copy from example on first boot)
if [ ! -f .env ]; then
    cp .env.example .env
fi

# Generate app key if it is missing
if ! grep -q "^APP_KEY=base64:" .env; then
    php artisan key:generate --force
fi

# Wait for MySQL to accept connections before migrating
echo "Waiting for database at ${DB_HOST}:${DB_PORT}..."
until php -r "exit(@fsockopen(getenv('DB_HOST'), (int) getenv('DB_PORT')) ? 0 : 1);"; do
    sleep 2
done

php artisan migrate --force || true

# Keep storage writable by the runtime user
chown -R www-data:www-data storage bootstrap/cache || true

exec "$@"
