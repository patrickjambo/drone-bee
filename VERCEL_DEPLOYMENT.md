# Vercel Deployment Guide - Clean Setup

## Prerequisites
- GitHub repository: https://github.com/patrickjambo/drone-bee
- Neon PostgreSQL database with URL: `postgresql://neondb_owner:npg_SjILsR70YEMl@ep-dark-tree-a8iaz1t8-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require`
- Admin credentials: `Jambo Patrick` / `drone456`

## Vercel Setup Steps

### 1. Delete Old Project
1. Go to https://vercel.com/dashboard
2. Find "drone-bee" project
3. Click "Settings" → Scroll down → "Delete Project"
4. Confirm deletion

### 2. Create New Project
1. Go to https://vercel.com/new
2. Import from GitHub: Select `patrickjambo/drone-bee`
3. Click "Import"

### 3. Environment Variables (CRITICAL)
In the "Configure Project" page, add these variables:

```
DATABASE_URL=postgresql://neondb_owner:npg_SjILsR70YEMl@ep-dark-tree-a8iaz1t8-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require

JWT_SECRET=super_secret_jwt_key_dronebee_2026
```

**IMPORTANT**: 
- Make sure DATABASE_URL is entered EXACTLY as shown
- Copy the full URL without any modifications
- These will be available during build AND runtime

### 4. Deploy
1. Click "Deploy"
2. Wait for build to complete (should see ✓ Compiled successfully)
3. Once deployed, visit: https://drone-bee.vercel.app/admin/login

### 5. Test Login
Use credentials:
- **Username**: `Jambo Patrick`
- **Password**: `drone456`

## Troubleshooting

### If build fails with "No database host":
1. Go to Vercel Settings → Environment Variables
2. Verify DATABASE_URL is set exactly as above
3. Redeploy (deploy button in Vercel dashboard)

### If login shows "Internal server error":
1. Check Vercel logs: Go to "Deployments" → Latest → "Function Logs"
2. Look for database connection errors
3. Verify DATABASE_URL environment variable matches schema

## Local Testing Before Deployment
```bash
# Build locally to verify
npm run build

# Start production server
npm start

# Test at http://localhost:3000/admin/login
```

All tests must pass locally before redeploying to Vercel.
