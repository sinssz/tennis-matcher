#!/bin/bash

# Tennis Matcher - Database Setup Script
# This script sets up the database with Supabase connection string

set -e

echo "🎾 Tennis Matcher - Database Setup"
echo "=================================="
echo ""

# Check if DATABASE_URL is provided
if [ -z "$1" ]; then
  echo "❌ Error: DATABASE_URL not provided"
  echo ""
  echo "Usage:"
  echo "  ./scripts/setup-database.sh 'your_database_url'"
  echo ""
  echo "Example:"
  echo "  ./scripts/setup-database.sh 'postgresql://postgres.xxx:pass@host:6543/postgres?pgbouncer=true'"
  exit 1
fi

DATABASE_URL="postgresql://postgres.balaiamnlkcjbqbyiftm:rlatlsgn1%21%21%40%23@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Validate DATABASE_URL format
echo "🔍 Validating connection string..."
if [[ ! $DATABASE_URL =~ ^postgresql:// ]]; then
  echo "❌ Error: Invalid connection string format"
  echo "   Must start with 'postgresql://'"
  exit 1
fi

if [[ $DATABASE_URL =~ :6543/ ]]; then
  echo "✅ Port 6543 detected (Connection pooling)"
else
  echo "⚠️  WARNING: Port 6543 not detected. Are you using connection pooling?"
fi

if [[ $DATABASE_URL =~ pgbouncer=true ]]; then
  echo "✅ pgbouncer parameter detected"
else
  echo "⚠️  WARNING: pgbouncer=true parameter not found"
  echo "   Recommended for serverless: ?pgbouncer=true&connection_limit=1"
fi

echo ""

# Update .env file
echo "📝 Updating .env file..."
cat > .env << EOF
# Database
DATABASE_URL="$DATABASE_URL"
EOF
echo "✅ .env file updated"

echo ""

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
pnpm db:generate
echo "✅ Prisma Client generated"

echo ""

# Apply schema
echo "📊 Applying database schema..."
DATABASE_URL="$DATABASE_URL" pnpm db:push
echo "✅ Schema applied"

echo ""

# Seed data
echo "🌱 Adding seed data..."
DATABASE_URL="$DATABASE_URL" pnpm db:seed
echo "✅ Seed data added"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  ✅ Database setup complete!                             ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "1. Start dev server: pnpm dev"
echo "2. Open http://localhost:3000"
echo "3. Set Vercel env: Copy this DATABASE_URL to Vercel dashboard"
echo ""
