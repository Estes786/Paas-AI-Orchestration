import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { renderer } from './renderer'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// Use renderer middleware
app.use(renderer)

// ============================================================================
// HOME PAGE
// ============================================================================
app.get('/', (c) => {
  return c.render(
    <div class="min-h-screen bg-gray-50">
      {/* Header */}
      <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span class="text-white text-xl font-bold">⚡</span>
              </div>
              <div>
                <h1 class="text-2xl font-bold text-gray-900">Multi-Account Orchestrator</h1>
                <p class="text-sm text-gray-500">Zero-Loss Context Handoff System</p>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <div class="text-right">
                <p class="text-sm text-gray-500">Total Projects</p>
                <p class="text-2xl font-bold text-gray-900" id="total-projects">0</p>
              </div>
              <div class="text-right">
                <p class="text-sm text-gray-500">Active Accounts</p>
                <p class="text-2xl font-bold text-blue-600" id="active-accounts">0</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white mb-8">
          <h2 class="text-3xl font-bold mb-4">🚀 Solve Multi-Account Credit Limitation</h2>
          <p class="text-lg mb-6 opacity-90">
            Manage 100+ AI accounts dengan zero-loss handoff. 
            No more re-explaining context. No more wasted credits. 
            Seamless continuation antar accounts.
          </p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-white/10 rounded-lg p-4">
              <div class="text-2xl font-bold mb-2">📝 Context Compression</div>
              <p class="text-sm opacity-90">Auto-compress conversation history</p>
            </div>
            <div class="bg-white/10 rounded-lg p-4">
              <div class="text-2xl font-bold mb-2">🔄 Smart Handoff</div>
              <p class="text-sm opacity-90">One-click context transfer</p>
            </div>
            <div class="bg-white/10 rounded-lg p-4">
              <div class="text-2xl font-bold mb-2">📊 Progress Tracking</div>
              <p class="text-sm opacity-90">Track project state across sessions</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div class="bg-white rounded-xl shadow-sm mb-8">
          <div class="border-b border-gray-200">
            <nav class="flex -mb-px">
              <button class="tab-button active" data-tab="dashboard">
                <i class="fas fa-chart-line mr-2"></i>Dashboard
              </button>
              <button class="tab-button" data-tab="projects">
                <i class="fas fa-folder-open mr-2"></i>Projects
              </button>
              <button class="tab-button" data-tab="accounts">
                <i class="fas fa-users mr-2"></i>Accounts
              </button>
              <button class="tab-button" data-tab="sessions">
                <i class="fas fa-history mr-2"></i>Sessions
              </button>
              <button class="tab-button" data-tab="handoff">
                <i class="fas fa-exchange-alt mr-2"></i>Handoff
              </button>
              <button class="tab-button" data-tab="knowledge">
                <i class="fas fa-book mr-2"></i>Knowledge
              </button>
            </nav>
          </div>
          
          {/* Tab Content */}
          <div class="p-6">
            {/* Dashboard Tab */}
            <div id="tab-dashboard" class="tab-content active">
              <h3 class="text-xl font-bold mb-4">📊 Overview Dashboard</h3>
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div class="stat-card">
                  <div class="stat-label">Total Credits Used</div>
                  <div class="stat-value text-blue-600" id="stat-credits">0</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Total Sessions</div>
                  <div class="stat-value text-green-600" id="stat-sessions">0</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Avg Efficiency</div>
                  <div class="stat-value text-purple-600" id="stat-efficiency">0%</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Success Rate</div>
                  <div class="stat-value text-orange-600" id="stat-success">0%</div>
                </div>
              </div>
              <div class="alert alert-info">
                <i class="fas fa-info-circle mr-2"></i>
                Dashboard akan otomatis update setelah ada project dan session data.
              </div>
            </div>

            {/* Projects Tab */}
            <div id="tab-projects" class="tab-content">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-bold">📁 Projects</h3>
                <button id="btn-new-project" class="btn btn-primary">
                  <i class="fas fa-plus mr-2"></i>New Project
                </button>
              </div>
              <div id="projects-list" class="space-y-4">
                {/* Will be populated by JavaScript */}
              </div>
            </div>

            {/* Accounts Tab */}
            <div id="tab-accounts" class="tab-content">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-bold">👥 AI Accounts Pool</h3>
                <button id="btn-new-account" class="btn btn-primary">
                  <i class="fas fa-user-plus mr-2"></i>Add Account
                </button>
              </div>
              <div id="accounts-list" class="space-y-4">
                {/* Will be populated by JavaScript */}
              </div>
            </div>

            {/* Sessions Tab */}
            <div id="tab-sessions" class="tab-content">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-bold">⏱️ Session History</h3>
                <div class="flex gap-2">
                  <select id="filter-project" class="border rounded-lg px-4 py-2">
                    <option value="">All Projects</option>
                  </select>
                  <select id="filter-account" class="border rounded-lg px-4 py-2">
                    <option value="">All Accounts</option>
                  </select>
                </div>
              </div>
              <div id="sessions-list" class="space-y-4">
                {/* Will be populated by JavaScript */}
              </div>
            </div>

            {/* Handoff Tab */}
            <div id="tab-handoff" class="tab-content">
              <h3 class="text-xl font-bold mb-4">🔄 Context Handoff Generator</h3>
              <div class="card">
                <form id="form-handoff" class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
                    <select id="handoff-project" class="w-full border rounded-lg px-4 py-2" required>
                      <option value="">-- Select Project --</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Current Session Context</label>
                    <textarea id="handoff-context" class="w-full border rounded-lg px-4 py-3" rows={8} 
                      placeholder="Paste conversation history atau describe apa yang sudah dilakukan di session ini..."></textarea>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Credits Used</label>
                      <input type="number" id="handoff-credits" class="w-full border rounded-lg px-4 py-2" 
                        placeholder="88" min="0" max="100" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">From Account</label>
                      <select id="handoff-from-account" class="w-full border rounded-lg px-4 py-2">
                        <option value="">-- Select Account --</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" class="btn btn-primary w-full">
                    <i class="fas fa-magic mr-2"></i>Generate Compressed Briefing
                  </button>
                </form>
                
                <div id="handoff-result" class="mt-6 hidden">
                  <h4 class="text-lg font-bold mb-3">✨ Compressed Briefing (Ready to Copy)</h4>
                  <div class="bg-gray-50 border rounded-lg p-4">
                    <pre id="handoff-output" class="whitespace-pre-wrap text-sm"></pre>
                  </div>
                  <div class="flex gap-2 mt-4">
                    <button id="btn-copy-briefing" class="btn btn-secondary flex-1">
                      <i class="fas fa-copy mr-2"></i>Copy to Clipboard
                    </button>
                    <button id="btn-download-briefing" class="btn btn-secondary flex-1">
                      <i class="fas fa-download mr-2"></i>Download as Text
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Knowledge Tab */}
            <div id="tab-knowledge" class="tab-content">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-bold">📚 Knowledge Base</h3>
                <button id="btn-new-knowledge" class="btn btn-primary">
                  <i class="fas fa-lightbulb mr-2"></i>Add Knowledge
                </button>
              </div>
              <div class="grid grid-cols-1 gap-4">
                <div id="knowledge-list">
                  {/* Will be populated by JavaScript */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer class="bg-white border-t mt-12 py-6">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>Built with ❤️ using Hono + Cloudflare Pages + D1 Database</p>
          <p class="mt-1">Solve multi-account credit limitation dengan zero-loss handoff.</p>
        </div>
      </footer>

      {/* Load external libraries and app script */}
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
      <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
      <script src="/static/app.js"></script>
    </div>
  )
})

// ============================================================================
// API ROUTES
// ============================================================================

// Get all projects
app.get('/api/projects', async (c) => {
  const { env } = c
  const result = await env.DB.prepare(`
    SELECT id, name, description, status, total_credits_used, total_sessions, 
           created_at, updated_at
    FROM projects
    ORDER BY updated_at DESC
  `).all()
  
  return c.json({ success: true, data: result.results })
})

// Create new project
app.post('/api/projects', async (c) => {
  const { env } = c
  const { name, description } = await c.req.json()
  
  const result = await env.DB.prepare(`
    INSERT INTO projects (name, description, status)
    VALUES (?, ?, 'active')
  `).bind(name, description).run()
  
  return c.json({ success: true, id: result.meta.last_row_id })
})

// Get all accounts
app.get('/api/accounts', async (c) => {
  const { env } = c
  const result = await env.DB.prepare(`
    SELECT id, account_name, platform, credits_available, status, 
           specialization, created_at, updated_at
    FROM accounts
    ORDER BY account_name
  `).all()
  
  return c.json({ success: true, data: result.results })
})

// Create new account
app.post('/api/accounts', async (c) => {
  const { env } = c
  const { account_name, account_email, platform, specialization } = await c.req.json()
  
  const result = await env.DB.prepare(`
    INSERT INTO accounts (account_name, account_email, platform, specialization, status)
    VALUES (?, ?, ?, ?, 'available')
  `).bind(account_name, account_email || null, platform || 'genspark', specialization || null).run()
  
  return c.json({ success: true, id: result.meta.last_row_id })
})

// Get sessions (with optional filters)
app.get('/api/sessions', async (c) => {
  const { env } = c
  const projectId = c.req.query('project_id')
  const accountId = c.req.query('account_id')
  
  let query = `
    SELECT s.id, s.session_number, s.session_type, s.credits_used, 
           s.duration_minutes, s.status, s.started_at, s.completed_at,
           p.name as project_name, a.account_name
    FROM sessions s
    JOIN projects p ON s.project_id = p.id
    JOIN accounts a ON s.account_id = a.id
    WHERE 1=1
  `
  
  const bindings = []
  if (projectId) {
    query += ` AND s.project_id = ?`
    bindings.push(projectId)
  }
  if (accountId) {
    query += ` AND s.account_id = ?`
    bindings.push(accountId)
  }
  
  query += ` ORDER BY s.started_at DESC LIMIT 50`
  
  const result = await env.DB.prepare(query).bind(...bindings).all()
  
  return c.json({ success: true, data: result.results })
})

// Create session
app.post('/api/sessions', async (c) => {
  const { env } = c
  const { project_id, account_id, session_type, objectives } = await c.req.json()
  
  // Get next session number for this project
  const countResult = await env.DB.prepare(`
    SELECT COUNT(*) as count FROM sessions WHERE project_id = ?
  `).bind(project_id).first()
  
  const sessionNumber = (countResult?.count as number || 0) + 1
  
  const result = await env.DB.prepare(`
    INSERT INTO sessions (project_id, account_id, session_number, session_type, 
                          objectives, status)
    VALUES (?, ?, ?, ?, ?, 'in_progress')
  `).bind(project_id, account_id, sessionNumber, session_type || 'development', objectives || '').run()
  
  return c.json({ success: true, id: result.meta.last_row_id, session_number: sessionNumber })
})

// Generate compressed briefing for handoff
app.post('/api/handoff/compress', async (c) => {
  const { env } = c
  const { project_id, context, credits_used, from_account_id } = await c.req.json()
  
  // Get project details
  const project = await env.DB.prepare(`
    SELECT name, description, status FROM projects WHERE id = ?
  `).bind(project_id).first()
  
  // Get latest session for context
  const latestSession = await env.DB.prepare(`
    SELECT session_number, accomplishments, blockers 
    FROM sessions 
    WHERE project_id = ? 
    ORDER BY started_at DESC 
    LIMIT 1
  `).bind(project_id).first()
  
  // Simple compression: Extract key points
  const lines = context.split('\n').filter(l => l.trim())
  const keyPoints = lines.slice(0, 15).join('\n') // Take first 15 lines
  
  // Generate compressed briefing
  const briefing = `# 🔄 CONTEXT HANDOFF - ${project?.name}

**Project**: ${project?.name}
**Session**: #${(latestSession?.session_number as number || 0) + 1}
**Credits Used Last Session**: ${credits_used || 'N/A'}
**Status**: In Progress

## 📝 Quick Context

${keyPoints}

## ✅ What's Done
${latestSession?.accomplishments || 'Check previous session'}

## 🚧 Blockers
${latestSession?.blockers || 'None reported'}

## 🎯 Next Steps
1. Review current codebase state
2. Continue from last checkpoint
3. Maintain credit efficiency (88-92 range)

---
*Auto-generated by Multi-Account Orchestrator*
`
  
  return c.json({ success: true, briefing })
})

// Get knowledge base
app.get('/api/knowledge', async (c) => {
  const { env } = c
  const category = c.req.query('category')
  
  let query = `
    SELECT id, category, title, description, tags, usage_count, 
           success_rate, created_at
    FROM knowledge_base
    WHERE 1=1
  `
  
  const bindings = []
  if (category) {
    query += ` AND category = ?`
    bindings.push(category)
  }
  
  query += ` ORDER BY usage_count DESC, success_rate DESC`
  
  const result = await env.DB.prepare(query).bind(...bindings).all()
  
  return c.json({ success: true, data: result.results })
})

// Get dashboard stats
app.get('/api/stats', async (c) => {
  const { env } = c
  
  const stats = await env.DB.batch([
    env.DB.prepare(`SELECT COUNT(*) as total FROM projects WHERE status = 'active'`),
    env.DB.prepare(`SELECT COUNT(*) as total FROM accounts WHERE status IN ('available', 'active')`),
    env.DB.prepare(`SELECT SUM(total_credits_used) as total FROM projects`),
    env.DB.prepare(`SELECT SUM(total_sessions) as total FROM projects`),
  ])
  
  return c.json({
    success: true,
    data: {
      active_projects: stats[0].results[0]?.total || 0,
      active_accounts: stats[1].results[0]?.total || 0,
      total_credits: stats[2].results[0]?.total || 0,
      total_sessions: stats[3].results[0]?.total || 0,
    }
  })
})

export default app
