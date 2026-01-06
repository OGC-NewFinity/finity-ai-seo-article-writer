#!/bin/sh
set -e

echo "Generating Prisma client..."
npx prisma generate

echo "Running Prisma migrations..."
npx prisma migrate deploy || echo "Migrations failed, continuing..."

echo "Starting application..."
exec npm run start
