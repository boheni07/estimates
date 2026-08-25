#!/bin/sh
set -e
echo "==> [Entrypoint] Starting Estimate Management System..."
echo "==> [Prisma] Syncing schema with PostgreSQL..."
./node_modules/.bin/prisma db push --skip-generate
echo "==> [Server] Launching Next.js Standalone Server on port ${PORT:-3000}..."
exec node server.js
