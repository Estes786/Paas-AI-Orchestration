-- AI Workflow Orchestrator - Public Edition Sample Data
-- Created: 2026-01-30
-- Purpose: Seed database with sample data for testing

-- Insert team members (demo users)
INSERT OR IGNORE INTO team_members (id, name, email, role, status) VALUES
  (1, 'John Doe', 'john@example.com', 'owner', 'active'),
  (2, 'Jane Smith', 'jane@example.com', 'admin', 'active'),
  (3, 'Bob Wilson', 'bob@example.com', 'member', 'active'),
  (4, 'Alice Johnson', 'alice@example.com', 'member', 'active');

-- Insert sample projects
INSERT OR IGNORE INTO projects (id, name, description, status, total_sessions, owner_id) VALUES
  (1, 'E-commerce AI Chatbot', 'Building an AI-powered customer service chatbot for e-commerce platform', 'active', 5, 1),
  (2, 'Content Generation Pipeline', 'Automated blog post generation with AI assistance', 'active', 3, 1),
  (3, 'Code Review Assistant', 'AI tool to assist with code reviews and suggestions', 'paused', 2, 2);

-- Insert project collaborators
INSERT OR IGNORE INTO project_collaborators (project_id, user_id, role) VALUES
  (1, 1, 'owner'),
  (1, 2, 'editor'),
  (1, 3, 'collaborator'),
  (2, 1, 'owner'),
  (2, 4, 'collaborator'),
  (3, 2, 'owner'),
  (3, 3, 'viewer');

-- Insert sample sessions
INSERT OR IGNORE INTO sessions (id, project_id, account_id, session_number, user_id, duration_minutes, session_type, objectives, accomplishments, blockers, ai_tools_used, status, started_at, completed_at) VALUES
  (1, 1, 1, 1, 1, 120, 'development', 
   'Setup project structure and API routes', 
   'Created Hono backend with 5 API routes, setup D1 database, deployed to Cloudflare Pages',
   NULL,
   '["ChatGPT", "Claude", "GenSpark"]',
   'completed', 
   '2026-01-28 09:00:00', 
   '2026-01-28 11:00:00'),
  
  (2, 1, 1, 2, 1, 90, 'feature',
   'Build chatbot conversation flow',
   'Implemented conversation logic, added context management, integrated OpenAI API',
   'Need to optimize token usage for long conversations',
   '["ChatGPT", "GenSpark"]',
   'completed',
   '2026-01-29 10:00:00',
   '2026-01-29 11:30:00'),
   
  (3, 1, 2, 3, 2, NULL, 'bugfix',
   'Fix chatbot response delay issue',
   NULL,
   'Investigating slow API response times, need to profile code',
   '["Claude"]',
   'in_progress',
   '2026-01-30 14:00:00',
   NULL),
   
  (4, 2, 1, 1, 1, 60, 'development',
   'Design content generation pipeline',
   'Created system architecture, defined data flow, selected AI models',
   NULL,
   '["Claude", "Gemini"]',
   'completed',
   '2026-01-27 15:00:00',
   '2026-01-27 16:00:00'),
   
  (5, 2, 1, 2, 4, 45, 'development',
   'Implement content generation API',
   'Built API endpoints, integrated with AI models, added rate limiting',
   'Need better prompt templates',
   '["ChatGPT", "GenSpark"]',
   'completed',
   '2026-01-29 13:00:00',
   '2026-01-29 13:45:00');

-- Insert context documents
INSERT OR IGNORE INTO context_documents (project_id, title, content, document_type, tags, author_id) VALUES
  (1, 'Project Architecture Overview',
   'The chatbot uses a Hono backend on Cloudflare Workers with D1 database for conversation storage. OpenAI GPT-4 powers the AI responses. Frontend is built with vanilla JS and Tailwind CSS.',
   'architecture',
   'architecture,backend,ai',
   1),
   
  (1, 'Current Status & Next Steps',
   'Completed: Basic chatbot flow, API integration, database setup. In Progress: Optimizing response times. Next: Add conversation history, implement user feedback system',
   'next_steps',
   'status,todo',
   1),
   
  (2, 'Content Generation Workflow',
   'Pipeline: User provides topic -> AI generates outline -> User reviews -> AI writes draft -> User edits -> AI optimizes SEO -> Publish',
   'summary',
   'workflow,process',
   1),
   
  (3, 'Code Review Standards',
   'Focus areas: Security vulnerabilities, performance issues, code style consistency, test coverage. AI assistant checks these automatically.',
   'best_practice',
   'standards,quality',
   2);

-- Insert knowledge base items
INSERT OR IGNORE INTO knowledge_base (category, title, description, content, tags, usage_count, success_rate, is_public, author_id) VALUES
  ('pattern', 
   'Hono + D1 Database Setup Pattern',
   'Standard pattern for setting up Hono backend with Cloudflare D1 database',
   'Steps: 1. Install Hono and wrangler, 2. Create wrangler.jsonc with D1 binding, 3. Create migrations folder, 4. Apply migrations with --local flag, 5. Use env.DB in routes',
   'hono,cloudflare,database',
   3, 100.0, 1, 1),
   
  ('solution',
   'Fixing CORS Issues in Cloudflare Workers',
   'How to properly configure CORS for API routes',
   'Use hono/cors middleware: app.use("/api/*", cors()). For custom origins: cors({ origin: ["https://example.com"] })',
   'cors,cloudflare,api',
   5, 100.0, 1, 1),
   
  ('tip',
   'Optimizing AI Token Usage',
   'Reduce costs by optimizing prompts and caching responses',
   'Strategies: 1. Cache frequent responses, 2. Use shorter prompts, 3. Implement streaming, 4. Batch requests where possible, 5. Use cheaper models for simple tasks',
   'ai,optimization,cost',
   2, 90.0, 1, 2),
   
  ('best_practice',
   'AI-Assisted Code Review Checklist',
   'Comprehensive checklist for reviewing code with AI assistance',
   'Check: 1. Security (SQL injection, XSS), 2. Performance (N+1 queries, memory leaks), 3. Error handling, 4. Code style, 5. Test coverage, 6. Documentation',
   'code-review,quality,checklist',
   4, 95.0, 1, 2),
   
  ('reference',
   'Cloudflare Pages Deployment Guide',
   'Quick reference for deploying to Cloudflare Pages',
   'Commands: npm run build (build project), wrangler pages deploy dist (deploy), wrangler pages project create <name> (create project). Remember to set environment variables via wrangler or dashboard.',
   'cloudflare,deployment,reference',
   6, 100.0, 1, 1);

-- Insert session comments
INSERT OR IGNORE INTO session_comments (session_id, user_id, comment) VALUES
  (2, 2, 'Great work on the conversation flow! The context management looks solid.'),
  (2, 3, 'I tested the chatbot and it works well. Maybe we can add conversation history in next session?'),
  (3, 1, 'Let me know if you need help with the performance profiling. I have experience with this.');

-- Insert project tags
INSERT OR IGNORE INTO project_tags (project_id, tag) VALUES
  (1, 'ai'),
  (1, 'chatbot'),
  (1, 'customer-service'),
  (2, 'ai'),
  (2, 'content'),
  (2, 'automation'),
  (3, 'ai'),
  (3, 'code-quality'),
  (3, 'devtools');

-- Insert sample subscriptions
INSERT OR IGNORE INTO subscriptions (user_id, plan_type, status, project_limit, session_limit, storage_limit_mb, current_period_start, current_period_end, trial_end_date) VALUES
  (1, 'pro', 'active', 999, 999, 5000, '2026-01-01', '2026-02-01', NULL),
  (2, 'team', 'active', 999, 999, 10000, '2026-01-15', '2026-02-15', NULL),
  (3, 'free', 'active', 3, 50, 100, NULL, NULL, NULL),
  (4, 'pro', 'trial', 999, 999, 5000, '2026-01-25', '2026-02-25', '2026-02-08');
