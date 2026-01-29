#!/bin/bash

echo "🔍 Tennis Matcher - 500 Error Diagnosis"
echo "========================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: Local environment
echo "1️⃣  Checking local environment..."
if [ -f .env ]; then
  if grep -q "DATABASE_URL" .env; then
    echo -e "${GREEN}✓ .env file exists with DATABASE_URL${NC}"
  else
    echo -e "${RED}✗ .env file exists but DATABASE_URL is missing${NC}"
  fi
else
  echo -e "${RED}✗ .env file not found${NC}"
fi
echo ""

# Check 2: Local build
echo "2️⃣  Checking if code builds locally..."
if pnpm build > /tmp/build.log 2>&1; then
  echo -e "${GREEN}✓ Code builds successfully locally${NC}"
else
  echo -e "${RED}✗ Build failed locally${NC}"
  echo "Check /tmp/build.log for details"
fi
echo ""

# Check 3: Test API locally
echo "3️⃣  Testing API locally..."
pnpm dev > /tmp/dev.log 2>&1 &
DEV_PID=$!
sleep 5

if curl -s http://localhost:3000/api/players > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Local API works${NC}"
  kill $DEV_PID 2>/dev/null
else
  echo -e "${RED}✗ Local API failed${NC}"
  echo "This suggests a database connection issue"
  kill $DEV_PID 2>/dev/null
fi
echo ""

# Check 4: Vercel deployment
echo "4️⃣  Checking Vercel deployment..."
VERCEL_URL="https://tennis-matcher-j0mfmff6n-shinhus-projects.vercel.app"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$VERCEL_URL/api/players")
if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ Vercel API returns 200${NC}"
  echo "Problem is fixed!"
elif [ "$HTTP_CODE" = "500" ]; then
  echo -e "${RED}✗ Vercel API returns 500${NC}"
  echo ""
  echo "This means:"
  echo "  → Local code works ✓"
  echo "  → Vercel deployment has issues ✗"
  echo ""
  echo -e "${YELLOW}Most likely cause: Missing or incorrect DATABASE_URL in Vercel${NC}"
else
  echo -e "${YELLOW}⚠ Vercel API returns $HTTP_CODE${NC}"
fi
echo ""

# Check 5: Diagnosis summary
echo "📋 DIAGNOSIS SUMMARY"
echo "===================="
echo ""
echo "If local works but Vercel fails:"
echo ""
echo -e "${YELLOW}→ Go to: https://vercel.com/dashboard${NC}"
echo "→ Select: tennis-matcher project"
echo "→ Go to: Settings > Environment Variables"
echo "→ Check: DATABASE_URL is set for Production"
echo ""
echo "Expected format:"
echo "postgresql://postgres.[PROJECT]:PASSWORD@[HOST]:6543/postgres?pgbouncer=true&connection_limit=1"
echo ""
echo "After setting DATABASE_URL:"
echo "1. Apply schema: DATABASE_URL='...' pnpm db:push"
echo "2. Redeploy from Vercel dashboard"
echo "3. Test again: curl $VERCEL_URL/api/players"
echo ""
echo "Full guide: ./scripts/check-vercel-env.md"
