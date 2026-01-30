-- Migration to Public Edition: Safe Migration from Old Schema
-- Created: 2026-01-30
-- Purpose: Safely migrate from private edition schema to public edition

-- Step 1: Add new columns to existing tables
ALTER TABLE projects ADD COLUMN owner_id INTEGER;

-- Step 2: Create new tables for public edition
CREATE TABLE IF NOT EXISTS team_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'member' CHECK(role IN ('owner', 'admin', 'member', 'viewer')),
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'invited')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_collaborators (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  role TEXT DEFAULT 'collaborator' CHECK(role IN ('owner', 'editor', 'collaborator', 'viewer')),
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES team_members(id) ON DELETE CASCADE,
  UNIQUE(project_id, user_id)
);

CREATE TABLE IF NOT EXISTS context_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  document_type TEXT DEFAULT 'summary' CHECK(document_type IN ('summary', 'architecture', 'decisions', 'notes', 'next_steps')),
  tags TEXT,
  author_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES team_members(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS session_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  comment TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES team_members(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  tag TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  UNIQUE(project_id, tag)
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  plan_type TEXT NOT NULL CHECK(plan_type IN ('free', 'pro', 'team', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'cancelled', 'expired', 'trial')),
  project_limit INTEGER DEFAULT 3,
  session_limit INTEGER DEFAULT 50,
  storage_limit_mb INTEGER DEFAULT 100,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  current_period_start DATE,
  current_period_end DATE,
  trial_end_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES team_members(id) ON DELETE CASCADE
);

-- Step 3: Modify sessions table by adding new columns
ALTER TABLE sessions ADD COLUMN user_id INTEGER REFERENCES team_members(id);
ALTER TABLE sessions ADD COLUMN ai_tools_used TEXT;

-- Step 4: Modify knowledge_base table
ALTER TABLE knowledge_base ADD COLUMN content TEXT;
ALTER TABLE knowledge_base ADD COLUMN is_public BOOLEAN DEFAULT 0;
ALTER TABLE knowledge_base ADD COLUMN author_id INTEGER REFERENCES team_members(id);

-- Step 5: Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_team_email ON team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_status ON team_members(status);

CREATE INDEX IF NOT EXISTS idx_collaborators_project ON project_collaborators(project_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_user ON project_collaborators(user_id);

CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);

CREATE INDEX IF NOT EXISTS idx_context_project ON context_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_context_type ON context_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_context_updated ON context_documents(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_comments_session ON session_comments(session_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON session_comments(user_id);

CREATE INDEX IF NOT EXISTS idx_tags_project ON project_tags(project_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON subscriptions(plan_type);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_knowledge_public ON knowledge_base(is_public);
CREATE INDEX IF NOT EXISTS idx_knowledge_author ON knowledge_base(author_id);
