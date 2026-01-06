#!/bin/bash
# Helper script to set a user as admin
# Usage: ./set_admin_user.sh user@example.com

if [ -z "$1" ]; then
    echo "Usage: $0 <user-email>"
    echo "Example: $0 admin@example.com"
    exit 1
fi

EMAIL="$1"

echo "Setting user $EMAIL as admin..."

docker-compose exec auth-db psql -U postgres -d finity_auth -c "UPDATE \"user\" SET role = 'admin' WHERE email = '$EMAIL';"

echo "Verifying admin status..."
docker-compose exec auth-db psql -U postgres -d finity_auth -c "SELECT email, role FROM \"user\" WHERE email = '$EMAIL';"
