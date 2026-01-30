-- Seed data for Multi-Account Context Orchestrator
-- Created: 2026-01-30

-- Insert sample accounts
INSERT OR IGNORE INTO accounts (account_name, account_email, platform, credits_available, status, specialization) VALUES
('Account-01', 'account01@example.com', 'genspark', 95, 'available', 'Frontend Development'),
('Account-02', 'account02@example.com', 'genspark', 88, 'available', 'Backend API'),
('Account-03', 'account03@example.com', 'genspark', 100, 'available', 'Database Design'),
('Account-04', 'account04@example.com', 'genspark', 92, 'active', 'Full Stack'),
('Account-05', 'account05@example.com', 'genspark', 78, 'available', 'DevOps & Deployment'),
('Claude-Main', 'claude@example.com', 'claude', 85, 'available', 'Code Review & Architecture'),
('ChatGPT-01', 'gpt@example.com', 'chatgpt', 90, 'available', 'Documentation & Testing');

-- Insert sample projects
INSERT OR IGNORE INTO projects (name, description, status, total_credits_used, total_sessions) VALUES
('Multi-Account Orchestrator', 'Web app untuk manage multi-account AI orchestration dengan zero-loss handoff', 'active', 0, 0),
('Barber SaaS Platform', 'Complete barbershop management system', 'paused', 450, 5),
('AI Agent Marketplace', 'Platform for buying and selling AI agents', 'active', 180, 2);

-- Insert knowledge base entries
INSERT OR IGNORE INTO knowledge_base (category, title, description, tags, usage_count, success_rate) VALUES
('pattern', 'Zero-Loss Handoff Protocol', 'Complete context transfer between accounts using checkpoint documents', 'handoff,context,orchestration', 15, 0.98),
('pattern', 'Credit Optimization Strategy', 'Maintain 88-92 credit usage per session for optimal efficiency', 'credits,optimization,efficiency', 12, 0.95),
('error_solution', 'Context Too Long Error', 'Compress conversation history using summarization before handoff', 'context,compression,error', 8, 0.92),
('best_practice', 'Git Commit Before Handoff', 'Always commit code before creating checkpoint document', 'git,handoff,workflow', 20, 1.0),
('optimization', 'Parallel Account Usage', 'Use multiple accounts simultaneously for different project components', 'parallel,accounts,scaling', 5, 0.88),
('tip', 'Account Specialization', 'Assign specific domains to accounts for better context efficiency', 'accounts,specialization,efficiency', 10, 0.90);
