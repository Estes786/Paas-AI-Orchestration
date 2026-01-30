# 🛠️ DEVELOPMENT GUIDE
## Multi-Account Context Orchestrator

**Last Updated:** 2026-01-30  
**Version:** 2.0.0  
**Author:** AI Developer with PAAS Vision  

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Setup Guide](#setup-guide)
4. [Development Workflow](#development-workflow)
5. [Database Management](#database-management)
6. [Deployment Guide](#deployment-guide)
7. [Troubleshooting](#troubleshooting)
8. [Enhancement Roadmap](#enhancement-roadmap)

---

## 🎯 Project Overview

### Vision
Transform multi-account AI orchestration from chaotic manual context transfer → seamless automated workflow.

### Core Value Proposition
```yaml
BEFORE:
  - 20 minutes per handoff
  - 15 credits wasted per session
  - Manual copy-paste context
  - Information loss
  - Workflow chaos

AFTER:
  - 1 minute per handoff (95% time saved)
  - 0 credits wasted (100% saving)
  - One-click automation
  - Zero information loss
  - Organized workflow
```

### Target Users
1. **AI Orchestrators** - Managing multiple AI accounts due to credit limits
2. **Non-Technical Users** - Need organized workflow without coding
3. **Team Collaboration** - Multiple people working on same projects
4. **Power Users** - Advanced features for optimization

---

## 🏗️ Architecture

### Technology Stack

```yaml
Frontend:
  Framework: Vanilla JavaScript + Tailwind CSS
  Icons: FontAwesome 6.4.0
  HTTP Client: Axios 1.6.0
  Build Tool: Vite 6.3.5

Backend:
  Framework: Hono 4.11.7 (Cloudflare Workers)
  Runtime: Cloudflare Pages
  Language: TypeScript 5.9.3

Database:
  Type: Cloudflare D1 (SQLite-based)
  ORM: None (Direct SQL queries)
  Migrations: Wrangler CLI

Deployment:
  Platform: Cloudflare Pages
  CDN: Global edge network
  Local Dev: PM2 Process Manager
```

### Database Schema

```sql
8 Tables:
  1. projects - Core project management
  2. accounts - AI account pool
  3. sessions - Work session tracking
  4. checkpoints - State snapshots
  5. handoff_queue - Pending handoffs
  6. session_metadata - Extended attributes
  7. account_specializations - Domain expertise
  8. knowledge_base - Patterns & solutions
```

### Directory Structure

```
webapp/
├── src/
│   ├── index.tsx              # Main Hono app (API + Frontend)
│   └── renderer.tsx           # JSX renderer
├── public/
│   └── static/
│       ├── app.js             # Frontend JavaScript
│       └── style.css          # Custom CSS
├── migrations/
│   └── 0001_initial_schema.sql # Database schema
├── seed.sql                   # Sample data
├── ecosystem.config.cjs       # PM2 configuration
├── wrangler.jsonc            # Cloudflare config
├── package.json              # Dependencies & scripts
├── tsconfig.json             # TypeScript config
└── vite.config.ts            # Vite build config
```

---

## 🚀 Setup Guide

### Prerequisites

```bash
# Required
- Node.js 18+ 
- npm 10+
- Cloudflare account (for production)

# Optional (for local dev)
- PM2 (pre-installed in sandbox)
- Wrangler CLI (installed via npm)
```

### Initial Setup

```bash
# 1. Clone repository
git clone https://github.com/Estes786/Paas-AI-Orchestration.git
cd Paas-AI-Orchestration

# 2. Install dependencies
npm install

# 3. Initialize git (if not already)
git init
git add .
git commit -m "Initial commit"

# 4. Setup local D1 database
npm run db:migrate:local
npm run db:seed

# 5. Build project
npm run build

# 6. Start development server
pm2 start ecosystem.config.cjs
```

### Environment Variables

For production deployment:

```bash
# .dev.vars (local development)
ENVIRONMENT=development
DEBUG=true

# Cloudflare secrets (production)
wrangler pages secret put API_KEY --project-name webapp
```

---

## 💻 Development Workflow

### Daily Development Cycle

```bash
# 1. Start development
fuser -k 3000/tcp || true    # Clean port
npm run build                # Build once
pm2 start ecosystem.config.cjs  # Start server

# 2. Check status
pm2 list                     # Process status
npm run test                 # Test with curl

# 3. Make changes
# Edit files in src/, public/static/
# Wrangler auto-reloads most changes

# 4. View logs
pm2 logs webapp --nostream

# 5. Restart (if needed)
pm2 restart webapp

# 6. Commit changes
git add .
git commit -m "feat: your changes"
git push origin main
```

### Code Modification Guidelines

**Frontend Changes (public/static/app.js):**
- No rebuild needed, just refresh browser
- Check browser console for errors
- Use Chrome DevTools for debugging

**Backend Changes (src/index.tsx):**
- Wrangler auto-reloads in most cases
- If not working, restart PM2: `pm2 restart webapp`
- Check PM2 logs: `pm2 logs webapp --nostream`

**Database Changes (migrations/):**
- Create new migration file: `0002_your_changes.sql`
- Apply locally: `npm run db:migrate:local`
- Test thoroughly before production

**CSS Changes (public/static/style.css):**
- No rebuild needed, just refresh browser
- Use browser DevTools to test first

---

## 🗄️ Database Management

### Local Development (--local mode)

```bash
# Apply migrations
npm run db:migrate:local

# Seed sample data
npm run db:seed

# Reset database (DANGER: deletes all data)
npm run db:reset

# Execute SQL query
npm run db:console:local
# Then type SQL: SELECT * FROM projects;

# Execute SQL from file
wrangler d1 execute webapp-production --local --file=./query.sql
```

### Production Database

```bash
# Create production D1 database (first time only)
npx wrangler d1 create webapp-production
# Copy database_id to wrangler.jsonc

# Apply migrations to production
npm run db:migrate:prod

# Execute SQL query in production
npm run db:console:prod
# Then type SQL: SELECT COUNT(*) FROM sessions;

# Backup production data
npx wrangler d1 export webapp-production > backup.sql
```

### Database Queries

**Common Queries:**

```sql
-- Get all active projects
SELECT * FROM projects WHERE status = 'active';

-- Get account with highest credits
SELECT * FROM accounts ORDER BY credits_available DESC LIMIT 1;

-- Get recent sessions
SELECT * FROM sessions ORDER BY created_at DESC LIMIT 10;

-- Calculate total credits used
SELECT SUM(credits_used) as total FROM sessions;

-- Get success rate
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
  (SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as success_rate
FROM sessions;
```

---

## 🚀 Deployment Guide

### Sandbox Deployment (Testing)

```bash
# Already running if you followed setup
# Access via: GetServiceUrl tool in sandbox
# URL format: https://3000-<sandbox-id>.sandbox.novita.ai
```

### Cloudflare Pages Production Deployment

**Step 1: Setup Cloudflare Authentication**

```bash
# Call setup_cloudflare_api_key tool first
# This configures CLOUDFLARE_API_TOKEN

# Verify authentication
npx wrangler whoami
```

**Step 2: Create Production Database**

```bash
# Create D1 database
npx wrangler d1 create webapp-production

# Output will show database_id
# Update wrangler.jsonc with the real database_id
```

**Step 3: Create Cloudflare Pages Project**

```bash
# Create project (use main branch)
npx wrangler pages project create webapp \
  --production-branch main \
  --compatibility-date 2024-01-01
```

**Step 4: Build and Deploy**

```bash
# Build dist directory
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name webapp

# You'll receive URLs:
# Production: https://<random-id>.webapp.pages.dev
# Branch: https://main.webapp.pages.dev
```

**Step 5: Apply Database Migrations**

```bash
# Apply migrations to production database
npm run db:migrate:prod

# Verify
npx wrangler d1 execute webapp-production \
  --command="SELECT name FROM sqlite_master WHERE type='table';"
```

**Step 6: Verify Deployment**

```bash
# Test production URL
curl https://webapp.pages.dev
curl https://webapp.pages.dev/api/stats
curl https://webapp.pages.dev/api/accounts
```

### GitHub Integration

```bash
# Setup git remote
git remote add origin https://ghp_YOUR_TOKEN@github.com/Estes786/Paas-AI-Orchestration.git

# Push to GitHub
git push -f origin main  # Force push for new repo
git push origin main     # Normal push

# Auto-deploy on push (optional)
# Configure in Cloudflare Pages dashboard:
# Settings -> Builds & Deployments -> Enable GitHub integration
```

---

## 🐛 Troubleshooting

### Common Issues

**1. Port 3000 Already in Use**

```bash
# Solution
fuser -k 3000/tcp || true
pm2 restart webapp
```

**2. PM2 Not Responding**

```bash
# Solution
pm2 delete webapp
pm2 start ecosystem.config.cjs
```

**3. Database Not Found**

```bash
# Solution
npm run db:reset  # Recreate & reseed
```

**4. Build Errors**

```bash
# Check node_modules
rm -rf node_modules package-lock.json
npm install

# Clean build
rm -rf dist .wrangler
npm run build
```

**5. API Returns Empty Data**

```bash
# Check if database is seeded
wrangler d1 execute webapp-production --local \
  --command="SELECT COUNT(*) FROM projects;"

# If empty, reseed
npm run db:seed
```

**6. Static Files 404**

```bash
# Ensure files are in correct location
ls -la public/static/

# Check serveStatic path in src/index.tsx
# Should be: serveStatic({ root: './public' })
```

**7. Wrangler Authentication Failed**

```bash
# Use setup_cloudflare_api_key tool
# Don't use: wrangler login (won't work in sandbox)
```

---

## 🎯 Enhancement Roadmap

### Phase 1: Core Features (✅ DONE)
- ✅ Multi-account management
- ✅ Project & session tracking
- ✅ Zero-loss handoff system
- ✅ Knowledge base
- ✅ D1 database integration
- ✅ Cloudflare Pages deployment

### Phase 2: Advanced Features (⏳ NEXT)

**A. AI-Powered Context Compression**
```typescript
// Use Cloudflare AI Workers Binding
app.post('/api/compress', async (c) => {
  const { AI } = c.env
  const result = await AI.run('@cf/meta/llama-2-7b-chat-int8', {
    prompt: `Compress this conversation:\n${context}`
  })
  return c.json({ compressed: result.response })
})
```

**B. Export/Import System**
```typescript
// Export project as ZIP
app.get('/api/export/:projectId', async (c) => {
  // Generate ZIP with all project data
  // Include: sessions, checkpoints, metadata
})

// Import project from ZIP
app.post('/api/import', async (c) => {
  // Parse ZIP and restore to database
})
```

**C. Analytics Dashboard**
```typescript
// Time series analysis
// Credit usage patterns
// Success rate trends
// Account efficiency metrics
```

### Phase 3: Collaboration Features (🚀 FUTURE)

**A. Team Management**
```sql
CREATE TABLE teams (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id INTEGER
);

CREATE TABLE team_members (
  team_id INTEGER,
  user_id INTEGER,
  role TEXT,
  FOREIGN KEY (team_id) REFERENCES teams(id)
);
```

**B. Real-time Collaboration**
```typescript
// WebSocket integration for live updates
// Cloudflare Durable Objects for state management
```

**C. Advanced Security**
```typescript
// API key authentication
// Role-based access control (RBAC)
// Audit logging
```

### Phase 4: Monetization (💰 PLATFORM)

**A. SaaS Features**
```yaml
Free Tier:
  - 3 projects
  - 10 accounts
  - Basic handoff

Pro Tier ($19/month):
  - Unlimited projects
  - 100 accounts
  - AI compression
  - Analytics dashboard

Enterprise ($99/month):
  - Team collaboration
  - Custom domains
  - Priority support
  - White-label option
```

**B. API Marketplace**
```typescript
// Public API for third-party integrations
// Webhook support
// Developer documentation
```

---

## 📚 Resources

### Documentation
- [Hono Framework](https://hono.dev/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Cloudflare Pages](https://pages.cloudflare.com/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

### Community
- GitHub Issues: Report bugs & feature requests
- Discord: Real-time discussion
- Documentation: Contribute improvements

---

## 🎉 Contributing

### Contribution Guidelines

1. **Fork repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes** with clear commits
4. **Test thoroughly** locally
5. **Push to branch**: `git push origin feature/amazing-feature`
6. **Open Pull Request** with detailed description

### Code Standards

```yaml
TypeScript:
  - Use strict types
  - No 'any' types
  - Document complex functions

JavaScript:
  - ES6+ syntax
  - Async/await for promises
  - Clear variable names

SQL:
  - Use parameterized queries
  - Create indexes for performance
  - Document complex queries

Git Commits:
  - Format: "type: description"
  - Types: feat, fix, docs, refactor, test
  - Be descriptive and concise
```

---

## 🙏 Credits

**Built with:**
- Hono Framework by Yusuke Wada
- Cloudflare Pages & Workers
- Tailwind CSS
- FontAwesome Icons

**Inspired by:**
- Multi-Account Orchestration Documentation
- PAAS AI Orchestrator Vision
- Real pain points from AI orchestrators

**Special Thanks:**
- GenSpark AI Developer platform
- Claude Code for assistance
- The open-source community

---

## 📞 Contact & Support

**Issues:** GitHub Issues tab  
**Email:** Your email here  
**Documentation:** This guide + README.md  

---

**Last Updated:** 2026-01-30  
**Version:** 2.0.0  
**Status:** ✅ Production Ready  

**END OF DEVELOPMENT GUIDE**
