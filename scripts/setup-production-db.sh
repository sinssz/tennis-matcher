#!/bin/bash

# Setup Production Database Script
# This script applies the Prisma schema to your production database

echo "🚀 Tennis Matcher - Production Database Setup"
echo ""

# Check if DATABASE_URL is provided
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL environment variable is not set"
  echo ""
  echo "Usage:"
  echo "  DATABASE_URL='your_production_url' ./scripts/setup-production-db.sh"
  echo ""
  echo "Example for Supabase:"
  echo "  DATABASE_URL='postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres?pgbouncer=true' ./scripts/setup-production-db.sh"
  exit 1
fi

echo "📋 Checking DATABASE_URL format..."
if [[ $DATABASE_URL == *"pgbouncer=true"* ]]; then
  echo "✅ Connection pooling detected"
else
  echo "⚠️  WARNING: Connection string doesn't include pgbouncer parameter"
  echo "   For Supabase/serverless, add: ?pgbouncer=true&connection_limit=1"
fi

echo ""
echo "🔧 Generating Prisma Client..."
pnpm db:generate

echo ""
echo "📊 Applying schema to production database..."
pnpm db:push

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Optional: Run seed data"
echo "  DATABASE_URL='your_url' pnpm db:seed"
