# Troubleshooting Guide

## 500 Error on POST /api/players

### Quick Diagnosis Checklist

1. ✅ **Check Vercel Environment Variables**
2. ✅ **Verify Connection String Format**
3. ✅ **Apply Database Schema**
4. ✅ **Check Vercel Logs**

---

## Step 1: Check Vercel Environment Variables

### Via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `tennis-matcher`
3. Go to **Settings** → **Environment Variables**
4. Verify `DATABASE_URL` exists for **Production**

If missing, add it with your database connection string.

### Via Vercel CLI

```bash
# Install Vercel CLI if not installed
npm install -g vercel

# Login
vercel login

# Check environment variables
vercel env ls

# Add if missing
vercel env add DATABASE_URL production
```

---

## Step 2: Verify Connection String Format

### ❌ Common Mistakes

```bash
# Wrong: Using direct connection (port 5432)
DATABASE_URL="postgresql://postgres:pass@host:5432/postgres"

# Wrong: Missing pgbouncer parameter
DATABASE_URL="postgresql://postgres:pass@host:6543/postgres"
```

### ✅ Correct Format for Serverless (Vercel)

```bash
# For Supabase:
DATABASE_URL="postgresql://postgres.[PROJECT]:PASSWORD@[HOST]:6543/postgres?pgbouncer=true&connection_limit=1"

# For Neon:
DATABASE_URL="postgresql://user:password@[HOST]/dbname?sslmode=require"
```

**Key Points:**
- Use **port 6543** for Supabase (connection pooling)
- Add `?pgbouncer=true&connection_limit=1` for Supabase
- For Neon, use `?sslmode=require`

### How to Get the Correct Connection String

#### Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Project Settings** → **Database**
4. Under "Connection string", select **Connection pooling**
5. Choose **URI** mode
6. Copy the connection string
7. Replace `[YOUR-PASSWORD]` with your actual database password

#### Neon

1. Go to [Neon Dashboard](https://console.neon.tech)
2. Select your project
3. Click **Connection Details**
4. Copy the **Connection string** (already includes pooling)

---

## Step 3: Apply Database Schema

Your production database might not have the tables created yet.

### Using the Setup Script

```bash
# Navigate to project directory
cd /Users/dreamus_01/Desktop/workspaces_ksh/tennis-matcher

# Run the setup script with your production DATABASE_URL
DATABASE_URL="your_production_connection_string" ./scripts/setup-production-db.sh
```

### Manual Steps

```bash
# 1. Generate Prisma Client
pnpm db:generate

# 2. Apply schema to production database
DATABASE_URL="your_production_url" pnpm db:push

# 3. (Optional) Seed sample data
DATABASE_URL="your_production_url" pnpm db:seed
```

---

## Step 4: Check Vercel Logs

### Via Vercel Dashboard

1. Go to your Vercel project
2. Click **Deployments**
3. Click on the most recent deployment
4. Click **Functions** tab
5. Look for `/api/players` and check the error logs

### Via Vercel CLI

```bash
# View real-time logs
vercel logs --follow

# View logs for specific deployment
vercel logs [deployment-url]
```

### Common Error Messages

#### Error: "relation \"Player\" does not exist"

**Cause**: Database schema not applied

**Solution**: Run `DATABASE_URL="..." pnpm db:push`

#### Error: "prepared statement \"s0\" already exists"

**Cause**: Missing `pgbouncer=true` parameter

**Solution**: Add `?pgbouncer=true&connection_limit=1` to connection string

#### Error: "connect ETIMEDOUT"

**Cause**:
- Database is not accessible from Vercel
- Database service is paused (Supabase free tier)
- Wrong host/port

**Solution**:
- Check database is running
- For Supabase, visit your project dashboard to wake it up
- Verify connection string host and port

#### Error: "password authentication failed"

**Cause**: Incorrect password in DATABASE_URL

**Solution**:
- Reset database password in Supabase/Neon dashboard
- Update DATABASE_URL in Vercel environment variables
- Redeploy

---

## Step 5: Redeploy After Fixes

After fixing environment variables:

### Via Vercel Dashboard

1. Go to **Deployments**
2. Click **⋯** on the latest deployment
3. Click **Redeploy**

### Via Vercel CLI

```bash
vercel --prod
```

### Via Git Push

```bash
git commit --allow-empty -m "chore: trigger redeploy"
git push origin main
```

---

## Step 6: Test the Fix

After redeploying, test the API:

```bash
# Test GET request
curl https://your-app.vercel.app/api/players

# Test POST request
curl -X POST https://your-app.vercel.app/api/players \
  -H "Content-Type: application/json" \
  -d '{"name":"테스트","gender":"MALE","level":"C"}'
```

Expected successful response:
```json
{
  "data": {
    "id": "...",
    "name": "테스트",
    "gender": "MALE",
    "level": "C",
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  },
  "message": "참가자가 성공적으로 생성되었습니다"
}
```

---

## Additional Debugging

### Enable Prisma Query Logging

Add to your Prisma client (for debugging only):

```typescript
// src/lib/db.ts
export const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});
```

### Check Database Connection Directly

```bash
# Using psql
psql "your_connection_string"

# Test query
SELECT * FROM "Player";
```

---

## Still Having Issues?

1. **Check Supabase/Neon Dashboard**
   - Is the database service running?
   - Is it paused due to inactivity?
   - Are there connection limits reached?

2. **Verify Vercel Build Logs**
   - Go to Deployments → Build Logs
   - Check if Prisma client was generated successfully

3. **Test Locally with Production Database**
   ```bash
   # Use production DATABASE_URL locally
   DATABASE_URL="production_url" pnpm dev

   # Test the API at http://localhost:3000/api/players
   ```

4. **Contact Support**
   - Vercel Support: https://vercel.com/support
   - Supabase Support: https://supabase.com/support
   - Neon Support: https://neon.tech/docs/introduction/support

---

## Prevention Checklist

Before deploying:

- [ ] DATABASE_URL is set in Vercel environment variables
- [ ] Connection string includes proper parameters (pgbouncer, etc.)
- [ ] Database schema is applied (`pnpm db:push`)
- [ ] Test API endpoints locally first
- [ ] Check Vercel build logs for Prisma generation
- [ ] Verify database service is active and accessible

---

## Quick Reference

**Supabase Connection String Format:**
```
postgresql://postgres.[PROJECT]:PASSWORD@[HOST]:6543/postgres?pgbouncer=true&connection_limit=1
```

**Apply Schema to Production:**
```bash
DATABASE_URL="..." pnpm db:push
```

**Check Vercel Logs:**
```bash
vercel logs --follow
```

**Redeploy:**
```bash
vercel --prod
```
