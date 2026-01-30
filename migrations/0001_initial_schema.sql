-- Multi-Account Context Orchestrator Database Schema
-- Created: 2026-01-30

-- Projects table: Track all projects being orchestrated
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'paused', 'completed', 'archived')),
  total_credits_used INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Accounts table: Track all AI accounts in the pool
CREATE TABLE IF NOT EXISTS accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_name TEXT NOT NULL UNIQUE,
  account_email TEXT,
  platform TEXT DEFAULT 'genspark' CHECK(platform IN ('genspark', 'claude', 'chatgpt', 'gemini', 'other')),
  credits_available INTEGER DEFAULT 100,
  credits_refresh_date DATE,
  status TEXT DEFAULT 'available' CHECK(status IN ('available', 'active', 'exhausted', 'blocked')),
  specialization TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table: Track each development session
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  account_id INTEGER NOT NULL,
  session_number INTEGER NOT NULL,
  session_type TEXT DEFAULT 'development' CHECK(session_type IN ('development', 'bugfix', 'feature', 'refactor', 'deployment')),
  credits_used INTEGER DEFAULT 0,
  duration_minutes INTEGER,
  objectives TEXT,
  accomplishments TEXT,
  blockers TEXT,
  handoff_notes TEXT,
  checkpoint_data TEXT,
  status TEXT DEFAULT 'in_progress' CHECK(status IN ('in_progress', 'completed', 'failed', 'handed_off')),
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- Context snapshots: Store compressed context for handoffs
CREATE TABLE IF NOT EXISTS context_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  snapshot_type TEXT DEFAULT 'handoff' CHECK(snapshot_type IN ('handoff', 'checkpoint', 'backup')),
  compressed_context TEXT NOT NULL,
  context_summary TEXT,
  file_count INTEGER DEFAULT 0,
  code_lines INTEGER DEFAULT 0,
  git_commit_hash TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Conversation history: Store conversation turns for context extraction
CREATE TABLE IF NOT EXISTS conversation_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  turn_number INTEGER NOT NULL,
  role TEXT CHECK(role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INTEGER,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Project files: Track important files and their states
CREATE TABLE IF NOT EXISTS project_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  last_modified DATETIME,
  size_bytes INTEGER,
  git_status TEXT,
  importance TEXT DEFAULT 'normal' CHECK(importance IN ('critical', 'high', 'normal', 'low')),
  notes TEXT,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  UNIQUE(project_id, file_path)
);

-- Handoff queue: Manage pending handoffs between accounts
CREATE TABLE IF NOT EXISTS handoff_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  from_account_id INTEGER NOT NULL,
  to_account_id INTEGER,
  priority INTEGER DEFAULT 5 CHECK(priority BETWEEN 1 AND 10),
  handoff_context TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'failed')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (from_account_id) REFERENCES accounts(id),
  FOREIGN KEY (to_account_id) REFERENCES accounts(id)
);

-- Knowledge base: Store learnings and patterns
CREATE TABLE IF NOT EXISTS knowledge_base (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL CHECK(category IN ('pattern', 'error_solution', 'optimization', 'best_practice', 'tip')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tags TEXT,
  usage_count INTEGER DEFAULT 0,
  success_rate REAL DEFAULT 1.0,
  source_session_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (source_session_id) REFERENCES sessions(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_updated ON projects(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_accounts_status ON accounts(status);
CREATE INDEX IF NOT EXISTS idx_accounts_platform ON accounts(platform);
CREATE INDEX IF NOT EXISTS idx_accounts_credits ON accounts(credits_available);

CREATE INDEX IF NOT EXISTS idx_sessions_project ON sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_sessions_account ON sessions(account_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_started ON sessions(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_context_session ON context_snapshots(session_id);
CREATE INDEX IF NOT EXISTS idx_context_type ON context_snapshots(snapshot_type);

CREATE INDEX IF NOT EXISTS idx_conversation_session ON conversation_history(session_id);
CREATE INDEX IF NOT EXISTS idx_conversation_timestamp ON conversation_history(timestamp);

CREATE INDEX IF NOT EXISTS idx_files_project ON project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_files_type ON project_files(file_type);

CREATE INDEX IF NOT EXISTS idx_handoff_status ON handoff_queue(status);
CREATE INDEX IF NOT EXISTS idx_handoff_priority ON handoff_queue(priority DESC);

CREATE INDEX IF NOT EXISTS idx_knowledge_category ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_usage ON knowledge_base(usage_count DESC);
