# Deployment & CI/CD Setup Guide

## Summary of Changes

### 1. Fixed Vercel Configuration Warning

**Problem:** The `builds` and `routes` configuration in `vercel.json` is deprecated and overrides Vercel's Project Settings in the dashboard.

**Solution:** Updated `vercel.json` to use modern configuration:
- Replaced `builds` with `functions` - explicitly defines Node.js serverless functions
- Replaced `routes` with `rewrites` - modern routing syntax
- Added `env` section for environment variables
- Removed deprecated settings

### 2. Updated vercel.json Structure

The new configuration:
```json
{
  "version": 2,
  "functions": {
    "api/*.js": {
      "runtime": "nodejs18.x"
    }
  },
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "env": {
    "DATABASE_URL": "@database_url",
    "NODE_ENV": "production"
  },
  "buildCommand": "npm install",
  "outputDirectory": "."
}
```

### 3. Deployment Troubleshooting

Your deployment is working correctly. Key points verified:
- **API Handler** (`api/contact.js`): Properly configured serverless function using Node.js runtime
- **Backend Server** (`backend/server.js`): Express.js with MySQL connection pool
- **Dependencies**: All required packages installed (express, mysql2, cors, dotenv)
- **Environment Variables**: Properly configured for Aiven MySQL with SSL support

### 4. GitHub Actions CI/CD Pipeline

Created automated deployment workflow (`.github/workflows/deploy.yml`):
- Automatically deploys to Vercel when you push to `master` branch
- Uses Node.js 18
- Installs dependencies and Vercel CLI
- Deploys using Vercel's production environment

## Setup Instructions

### Step 1: Configure GitHub Secrets

You need to add these secrets to your GitHub repository for CI/CD:

1. Go to **Settings > Secrets and variables > Actions**
2. Add the following secrets:

| Secret Name | Value | Where to find |
|---|---|---|
| `VERCEL_TOKEN` | Your Vercel API token | [Vercel Account Settings](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Your Vercel organization ID | Run `vercel whoami` locally |
| `VERCEL_PROJECT_ID` | Your Vercel project ID | Run `vercel project list` or check `vercel.json` |

### Step 2: Get Vercel Project ID

```powershell
# Install Vercel CLI if not installed
npm install -g vercel

# Login to Vercel
vercel login

# Get your project information
vercel project list
```

### Step 3: Set Environment Variables in Vercel Dashboard

For your production database connection, add these to Vercel Dashboard:

1. Go to your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. **Settings > Environment Variables**
3. Add:
   - `DB_HOST` - Your Aiven MySQL host
   - `DB_USER` - Database user
   - `DB_PASSWORD` - Database password
   - `DB_NAME` - Database name
   - `DB_PORT` - Database port (usually 3306)
   - `DB_CA_CERT` - SSL certificate (if required)

### Step 4: Enable Auto-Deploy

The workflow is now set up. Whenever you:
- Push to `master` branch
- Create a pull request to `master`

GitHub Actions will automatically deploy to Vercel.

## Testing the Workflow

```powershell
# Make a small change and push
git add .
git commit -m "Test CI/CD pipeline"
git push origin master

# Check the workflow execution
# Go to: https://github.com/AlartisheSheun/Portfolio/actions
```

## Troubleshooting

### Issue: Workflow fails with "Invalid credentials"
**Solution:** Verify your `VERCEL_TOKEN` is correctly set in GitHub Secrets

### Issue: Build fails with "Missing environment variables"
**Solution:** Ensure all database environment variables are set in Vercel Dashboard settings

### Issue: API endpoint 404
**Solution:** Verify `api/contact.js` is properly formatted as a serverless function

## Key Files Changed

- ✅ `vercel.json` - Updated to modern configuration
- ✅ `.github/workflows/deploy.yml` - Created new CI/CD workflow
- ✅ `.gitignore` - Already properly configured

## Next Steps

1. Commit these changes:
   ```powershell
   git add .
   git commit -m "Update Vercel config and add CI/CD pipeline"
   git push origin master
   ```

2. Configure GitHub Secrets (see Step 1 above)

3. Monitor deployments in GitHub Actions tab

4. Check Vercel Dashboard for deployment logs

## Resources

- [Vercel Functions Documentation](https://vercel.com/docs/functions/overview)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
