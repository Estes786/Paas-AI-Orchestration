-- PRIVATE TOOLS - Seed Data
-- Created: 2026-01-30
-- Purpose: Populate database dengan data untuk private orchestration tools

-- ============================================================================
-- PROJECTS: Your real orchestration projects
-- ============================================================================
INSERT OR IGNORE INTO projects (id, name, description, status, total_credits_used, total_sessions) VALUES 
(1, 'PAAS AI Orchestrator - Private Edition', 'Full-featured private orchestrator dengan advanced features untuk multi-account management, credit optimization, dan automated workflows', 'active', 1500, 25),
(2, 'Agentica Ecosystem', 'Multi-tier ecosystem development: Agent Marketplace + L4 Boss Dashboard + Validation SaaS', 'active', 2300, 32),
(3, 'Barber SaaS Platform', 'Complete barbershop management system dengan booking, inventory, dan analytics', 'active', 850, 15),
(4, 'Portfolio & Documentation', 'Organize 480+ files, create knowledge base, dan build professional portfolio', 'active', 620, 12);

-- ============================================================================
-- ACCOUNTS: Multi-account pool dengan specialization
-- ============================================================================
INSERT OR IGNORE INTO accounts (id, account_name, account_email, platform, credits_available, specialization, status) VALUES 
-- Main GenSpark Accounts
(1, 'GenSpark-Main', 'main@example.com', 'genspark', 92, 'Full-Stack Development, Architecture', 'active'),
(2, 'GenSpark-Frontend', 'frontend@example.com', 'genspark', 78, 'React, Vue, UI/UX Design', 'available'),
(3, 'GenSpark-Backend', 'backend@example.com', 'genspark', 85, 'Node.js, Hono, API Design', 'available'),
(4, 'GenSpark-Database', 'database@example.com', 'genspark', 95, 'PostgreSQL, D1, Data Modeling', 'available'),
(5, 'GenSpark-DevOps', 'devops@example.com', 'genspark', 88, 'Cloudflare, GitHub, CI/CD', 'available'),

-- Backup Accounts
(6, 'GenSpark-Backup-01', 'backup01@example.com', 'genspark', 100, 'General Development', 'available'),
(7, 'GenSpark-Backup-02', 'backup02@example.com', 'genspark', 100, 'General Development', 'available'),
(8, 'GenSpark-Backup-03', 'backup03@example.com', 'genspark', 100, 'General Development', 'available'),

-- Alternative Platforms
(9, 'Claude-Sonnet', 'claude@example.com', 'claude', 45, 'Code Analysis, Debugging', 'exhausted'),
(10, 'ChatGPT-4', 'gpt@example.com', 'chatgpt', 20, 'Planning, Documentation', 'exhausted');

-- ============================================================================
-- SESSIONS: Development session history
-- ============================================================================
INSERT OR IGNORE INTO sessions (id, project_id, account_id, session_number, session_type, credits_used, duration_minutes, objectives, accomplishments, status, started_at, completed_at) VALUES 
-- PAAS AI Orchestrator Sessions
(1, 1, 1, 1, 'development', 88, 45, 'Setup initial project structure with Hono + D1', 'Created project structure, setup database schema, implemented basic routes', 'completed', '2026-01-29 10:00:00', '2026-01-29 10:45:00'),
(2, 1, 2, 2, 'feature', 92, 50, 'Build frontend UI dengan Tailwind CSS', 'Completed dashboard, projects tab, accounts tab dengan responsive design', 'completed', '2026-01-29 14:00:00', '2026-01-29 14:50:00'),
(3, 1, 3, 3, 'development', 85, 40, 'Implement API endpoints for CRUD operations', 'All REST API endpoints working: projects, accounts, sessions, knowledge', 'completed', '2026-01-30 09:00:00', '2026-01-30 09:40:00'),
(4, 1, 5, 4, 'deployment', 72, 35, 'Deploy to Cloudflare Pages with D1 database', 'Successfully deployed to production, database migrations applied', 'completed', '2026-01-30 15:00:00', '2026-01-30 15:35:00'),

-- Agentica Ecosystem Sessions
(5, 2, 1, 1, 'development', 95, 55, 'Research & design ecosystem architecture', 'Defined 3-tier architecture: Marketplace + L4 Dashboard + Validation SaaS', 'completed', '2026-01-28 11:00:00', '2026-01-28 11:55:00'),
(6, 2, 4, 2, 'development', 88, 48, 'Design database schema untuk agent marketplace', 'Complete schema dengan users, agents, templates, subscriptions', 'completed', '2026-01-28 16:00:00', '2026-01-28 16:48:00'),

-- Barber SaaS Sessions
(7, 3, 2, 1, 'development', 82, 42, 'Create booking management UI', 'Calendar interface, appointment forms, customer management', 'completed', '2026-01-27 10:00:00', '2026-01-27 10:42:00');

-- ============================================================================
-- CONTEXT SNAPSHOTS: Handoff briefings
-- ============================================================================
INSERT OR IGNORE INTO context_snapshots (id, session_id, snapshot_type, compressed_context, context_summary, file_count, code_lines) VALUES 
(1, 1, 'handoff', 'Project: PAAS AI Orchestrator setup completed. Database schema created dengan 8 tables. Basic Hono routes implemented. Next: Build frontend UI.', 'Initial project setup dengan Hono framework dan D1 database', 5, 350),
(2, 2, 'handoff', 'Frontend UI completed. Dashboard statistics, project management, account pool interface all working. API integration dengan axios. Next: Enhance API endpoints.', 'Frontend UI development dengan Tailwind CSS', 8, 520),
(3, 3, 'checkpoint', 'All CRUD API endpoints implemented and tested. Projects, accounts, sessions, knowledge base fully functional. Database queries optimized. Ready for deployment.', 'Backend API development completed', 12, 780);

-- ============================================================================
-- KNOWLEDGE BASE: Patterns & solutions
-- ============================================================================
INSERT OR IGNORE INTO knowledge_base (category, title, description, tags, usage_count, success_rate) VALUES 
-- Development Patterns
('pattern', 'Zero-Loss Handoff Protocol', 'Compress context dengan key points extraction, store in context_snapshots, generate briefing template. Saves 20 mins per handoff.', 'handoff,context,optimization', 15, 0.95),
('pattern', 'Credit Optimization Strategy', 'Target 88-92 credits per session. Use PM2 logs --nostream. Batch API calls. Minimize token waste.', 'credits,optimization,efficiency', 12, 0.92),
('pattern', 'Multi-Account Rotation', 'Track credits_available per account. Auto-select best account based on specialization + available credits. Avoid exhausted accounts.', 'accounts,rotation,automation', 8, 0.88),

-- Error Solutions
('error_solution', 'Wrangler D1 Migration Fail', 'Error: migration already applied. Solution: Delete .wrangler/state/v3/d1 directory then rerun npm run db:migrate:local', 'wrangler,d1,migration', 5, 1.0),
('error_solution', 'PM2 Port 3000 Already in Use', 'Solution: fuser -k 3000/tcp 2>/dev/null || true before pm2 start', 'pm2,port,error', 10, 1.0),
('error_solution', 'Cloudflare Static Files 404', 'Files must be in public/static/ and referenced as /static/filename. Check serveStatic middleware.', 'cloudflare,static,404', 7, 0.95),

-- Best Practices
('best_practice', 'Always Build Before Starting Dev Server', 'For Cloudflare Pages projects: npm run build FIRST, then pm2 start ecosystem.config.cjs. Build creates dist/ folder required by wrangler pages dev.', 'build,workflow,cloudflare', 20, 1.0),
('best_practice', 'Use PM2 for Service Management', 'Never run servers directly. Always use PM2 daemon. Benefits: auto-restart, log management, non-blocking execution.', 'pm2,services,daemon', 18, 0.98),
('best_practice', 'Git Commit Frequently', 'Commit after every major change. Use descriptive messages. Helps with handoff context and rollback safety.', 'git,version-control,workflow', 15, 0.96),

-- Optimization Tips
('optimization', 'Batch Database Queries', 'Use env.DB.batch([query1, query2, ...]) instead of sequential queries. Reduces D1 request count and latency.', 'database,performance,d1', 6, 0.90),
('optimization', 'Compress Context Smartly', 'Extract first 15 lines + key accomplishments + blockers. Skip verbose logs. Target 200-300 char briefings.', 'context,compression,handoff', 12, 0.93),
('tip', 'Use Seed Data for Testing', 'seed-private.sql contains realistic test data. Run npm run db:seed after migrations for instant testing.', 'testing,database,workflow', 8, 1.0);

-- ============================================================================
-- PROJECT FILES: Track important files
-- ============================================================================
INSERT OR IGNORE INTO project_files (project_id, file_path, file_type, importance, notes) VALUES 
(1, 'src/index.tsx', 'typescript', 'critical', 'Main Hono application entry point'),
(1, 'wrangler.jsonc', 'config', 'critical', 'Cloudflare configuration dengan D1 binding'),
(1, 'migrations/0001_initial_schema.sql', 'sql', 'critical', 'Database schema definition'),
(1, 'package.json', 'config', 'high', 'Dependencies and npm scripts'),
(1, 'public/static/app.js', 'javascript', 'high', 'Frontend application logic'),
(1, 'README.md', 'markdown', 'high', 'Project documentation');

-- ============================================================================
-- HANDOFF QUEUE: Manage pending handoffs
-- ============================================================================
INSERT OR IGNORE INTO handoff_queue (session_id, from_account_id, to_account_id, priority, handoff_context, status) VALUES 
(4, 5, 1, 8, 'Deployment completed. Need to add advanced features: automated account rotation, GitHub integration, real-time updates.', 'pending');
