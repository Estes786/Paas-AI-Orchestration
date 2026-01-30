# 🚀 DEPLOYMENT GUIDE - PAAS AI ORCHESTRATOR PRIVATE EDITION

## Quick Start Deployment

### Prerequisites Checklist

```yaml
✅ Local testing completed
✅ Code pushed to GitHub
✅ Database migrated locally
✅ Cloudflare account ready
✅ Cloudflare API token (from Deploy tab)
```

---

## STEP 1: Setup Cloudflare API Key

### Get Your API Token:

1. **Open Deploy Tab** in AI Developer sidebar
2. **Follow instructions** to create Cloudflare API token
3. **Copy token** dan save securely
4. **Configure in AI Developer** Deploy settings

### Or Create Manually:

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click **Create Token**
3. Use template: **Edit Cloudflare Workers**
4. Permissions needed:
   - Account > Cloudflare Pages > Edit
   - Account > D1 > Edit
5. Copy token

---

## STEP 2: Deploy Database to Production

### Run Database Migrations:

```bash
# Navigate to project
cd /home/user/webapp

# Apply migrations to REMOTE database
npm run db:migrate:prod

# Expected output:
# ✅ 0001_initial_schema.sql
# ✅ 0003_migrate_to_public.sql
# 🚣 58 commands executed successfully
```

### Seed Production Data (Optional):

```bash
# Load private test data to production
npm run db:seed:prod

# WARNING: This adds test accounts to production
# Only run if you want test data in production
```

### Verify Database:

```bash
# Check database console
npm run db:console:prod

# Run query:
# SELECT COUNT(*) FROM projects;
# Should return: 4 (if seeded)
```

---

## STEP 3: Deploy to Cloudflare Pages

### Create Cloudflare Pages Project:

```bash
# Create project (first time only)
npx wrangler pages project create paas-ai-orchestration-private \
  --production-branch main \
  --compatibility-date 2026-01-30
```

### Deploy Application:

```bash
# Build and deploy
npm run deploy:prod

# Expected output:
# ✅ Build completed: dist/_worker.js (65.97 kB)
# ✅ Deploying to Cloudflare Pages...
# ✅ Success! Deployed to:
#    - Production: https://paas-ai-orchestration-private.pages.dev
#    - Branch: https://main.paas-ai-orchestration-private.pages.dev
```

---

## STEP 4: Verify Deployment

### Test Production URLs:

```bash
# Test main URL
curl https://paas-ai-orchestration-private.pages.dev/api/stats

# Expected: {"success":true,"data":{...}}

# Test private features
curl -X POST https://paas-ai-orchestration-private.pages.dev/api/private/select-best-account \
  -H "Content-Type: application/json" \
  -d '{"min_credits":50}'
```

### Open in Browser:

```
https://paas-ai-orchestration-private.pages.dev
```

You should see:
- Dashboard dengan statistics
- Projects tab
- Accounts tab (with your test data)
- Sessions, Handoff, Knowledge tabs
- All features working

---

## STEP 5: Configure Environment Variables (If Needed)

### Add Secrets to Cloudflare:

```bash
# If you have API keys or secrets to add
npx wrangler pages secret put API_KEY \
  --project-name paas-ai-orchestration-private

# Enter secret value when prompted
```

---

## TROUBLESHOOTING

### Problem: Wrangler Login Issues

```bash
# Solution 1: Use API token directly
export CLOUDFLARE_API_TOKEN=your_token_here

# Solution 2: Login via browser
npx wrangler login
```

### Problem: Database Migration Fails

```bash
# Check database exists
npx wrangler d1 list

# If not found, create database:
npx wrangler d1 create paas-private-production

# Copy database_id to wrangler.jsonc
# Then retry migration
```

### Problem: Build Fails

```bash
# Clear cache and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Problem: Deployment Fails

```bash
# Check wrangler.jsonc has correct database_id
cat wrangler.jsonc | grep database_id

# Should show: 71ef89ef-6757-4796-ab4e-9fa6d62e5c85

# If wrong, update and retry
```

---

## POST-DEPLOYMENT TASKS

### 1. Update README with Production URL:

Edit README.md and add:
```markdown
## 🌐 Production URLs

- **Production**: https://paas-ai-orchestration-private.pages.dev
- **API Base**: https://paas-ai-orchestration-private.pages.dev/api
- **GitHub**: https://github.com/Estes786/Paas-AI-Orchestration
```

### 2. Test All Features:

```bash
# Dashboard
curl https://YOUR_URL/api/stats

# Accounts
curl https://YOUR_URL/api/accounts

# Projects
curl https://YOUR_URL/api/projects

# Private: Best Account
curl -X POST https://YOUR_URL/api/private/select-best-account \
  -H "Content-Type: application/json" \
  -d '{"min_credits":50}'

# Private: Credit Analytics
curl -X POST https://YOUR_URL/api/private/analyze-credits \
  -H "Content-Type: application/json" \
  -d '{"project_id":1,"days":30}'
```

### 3. Commit Deployment Info:

```bash
cd /home/user/webapp
git add .
git commit -m "docs: Add production deployment URLs"
git push origin main
```

### 4. Backup Production Database:

```bash
# Export current state
curl -X POST https://YOUR_URL/api/private/export-project \
  -H "Content-Type: application/json" \
  -d '{"project_id":1}' > backup-$(date +%Y%m%d).json
```

---

## MAINTENANCE

### Regular Tasks:

```yaml
WEEKLY:
  - Review credit analytics
  - Check account pool status
  - Backup project data
  - Monitor efficiency scores

MONTHLY:
  - Analyze usage patterns
  - Optimize account specializations
  - Clean up exhausted accounts
  - Update knowledge base

QUARTERLY:
  - Full database backup
  - Review and archive old projects
  - Update documentation
  - Plan new features
```

---

## SECURITY BEST PRACTICES

### Access Control:

```yaml
✅ Keep Cloudflare dashboard access restricted
✅ Rotate API tokens every 3 months
✅ Monitor deployment logs for suspicious activity
✅ Use environment variables for all secrets
✅ Never commit API keys to git
```

### Data Protection:

```yaml
✅ Regular backups (weekly minimum)
✅ Export project data before major changes
✅ Keep local copies of critical data
✅ Use .gitignore for sensitive files
✅ Encrypt backup files if stored externally
```

---

## SCALING TIPS

### When to Scale:

```yaml
CURRENT LIMITS (Free Tier):
  - 100,000 requests/day
  - 10 GB D1 storage
  - 500 MB D1 row reads/day
  - 1 MB D1 row writes/day

UPGRADE TO WORKERS PAID WHEN:
  - More than 50 projects active
  - More than 1,000 sessions/day
  - Need faster response times
  - Want unlimited D1 operations
```

### Performance Optimization:

```yaml
TIPS:
  - Use indexed queries (already implemented)
  - Batch database operations
  - Cache frequent queries
  - Compress large responses
  - Use CDN for static assets
```

---

## MONITORING

### Key Metrics to Track:

```yaml
USAGE:
  - Requests per day
  - Average response time
  - Error rate
  - Database query performance

BUSINESS:
  - Active projects
  - Total sessions
  - Credit efficiency
  - Handoff frequency

TECHNICAL:
  - Build time
  - Bundle size
  - Memory usage
  - Cache hit rate
```

### Cloudflare Dashboard:

Monitor at: https://dash.cloudflare.com/
- Analytics > Web Analytics
- Workers & Pages > Your Project > Metrics
- D1 > Your Database > Metrics

---

## QUICK REFERENCE

### Important URLs:

```yaml
LOCAL:
  Development: https://3000-inzw4yjpyy5d9854ea721-5c13a017.sandbox.novita.ai
  
PRODUCTION:
  Main: https://paas-ai-orchestration-private.pages.dev
  API: https://paas-ai-orchestration-private.pages.dev/api
  
CLOUDFLARE:
  Dashboard: https://dash.cloudflare.com
  D1 Console: https://dash.cloudflare.com/d1
  Pages: https://dash.cloudflare.com/pages
  
GITHUB:
  Repository: https://github.com/Estes786/Paas-AI-Orchestration
  Settings: https://github.com/Estes786/Paas-AI-Orchestration/settings
```

### Common Commands:

```bash
# Local Development
npm run build && pm2 start ecosystem.config.cjs
npm run db:migrate:local
npm run db:seed

# Production
npm run deploy:prod
npm run db:migrate:prod

# Database
npm run db:console:local
npm run db:console:prod

# Git
git add . && git commit -m "message"
git push origin main

# PM2
pm2 list
pm2 logs webapp --nostream
pm2 restart webapp
pm2 delete webapp
```

---

## SUPPORT

### Getting Help:

```yaml
DOCUMENTATION:
  - README.md (comprehensive guide)
  - PRIVATE_EDITION_DELIVERY.md (feature overview)
  - This file (deployment guide)

CLOUDFLARE DOCS:
  - Pages: https://developers.cloudflare.com/pages
  - D1: https://developers.cloudflare.com/d1
  - Workers: https://developers.cloudflare.com/workers

COMMUNITY:
  - Cloudflare Discord
  - Hono Framework Discord
  - Stack Overflow (tag: cloudflare-workers)
```

---

## ✅ DEPLOYMENT CHECKLIST

```yaml
PRE-DEPLOYMENT:
  ✅ Local testing complete
  ✅ Code committed to git
  ✅ Database migrated locally
  ✅ All features verified
  ✅ README updated
  
DEPLOYMENT:
  ⏳ Cloudflare API key configured
  ⏳ Database migrated to production
  ⏳ Application deployed
  ⏳ Production URLs tested
  ⏳ All features verified in prod
  
POST-DEPLOYMENT:
  ⏳ README updated with prod URLs
  ⏳ Monitoring configured
  ⏳ Backup strategy implemented
  ⏳ Team notified (if applicable)
```

---

**Ready to deploy? Follow the steps above and you'll be live in minutes! 🚀**

**End of Deployment Guide**
