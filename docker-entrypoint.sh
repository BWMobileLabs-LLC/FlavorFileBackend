#!/bin/sh
set -e

echo "Waiting for database..."
until node -e "
const { Client } = require('pg');
const c = new Client({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});
c.connect().then(() => c.end()).then(() => process.exit(0)).catch(() => process.exit(1));
" >/dev/null 2>&1; do
  sleep 2
done

echo "Running database migrations..."
npm run migrate

echo "Starting server..."
exec npm start
