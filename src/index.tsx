import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { renderer } from './renderer'
import { generateAIHandoff, generateTroubleshootingPrompt, type ProjectContext } from './ai-handoff'

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

            {/* Sessions Tab - ENHANCED WITH SESSION ORCHESTRATION */}
            <div id="tab-sessions" class="tab-content">
              {/* Session Orchestration Notice */}
              <div class="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-4">
                <div class="flex items-start gap-3">
                  <i class="fas fa-infinity text-green-600 text-2xl mt-1"></i>
                  <div class="flex-1">
                    <h4 class="font-bold text-green-900 mb-1">♾️ INFINITY GROWTH SESSION ORCHESTRATION</h4>
                    <p class="text-sm text-green-800 mb-2">
                      1 PROJECT = MULTI-SESSION orchestration with auto-handoff generation. 
                      Setiap session baru auto-loads context dari session sebelumnya. ZERO context loss! 🚀
                    </p>
                    <div class="flex items-center gap-2 text-xs text-green-700">
                      <span class="bg-green-100 px-2 py-1 rounded">✅ Auto-save conversations</span>
                      <span class="bg-green-100 px-2 py-1 rounded">🔄 Auto-generate handoff</span>
                      <span class="bg-green-100 px-2 py-1 rounded">♾️ Infinite continuity</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-bold">⏱️ Session Orchestration Hub</h3>
                <div class="flex gap-2">
                  <select id="filter-project" class="border rounded-lg px-4 py-2">
                    <option value="">All Projects</option>
                  </select>
                  <button id="btn-new-session" class="btn btn-primary">
                    <i class="fas fa-plus mr-2"></i>New Session
                  </button>
                </div>
              </div>
              
              {/* Active Session Indicator */}
              <div id="active-session-indicator" class="hidden bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <div>
                      <div class="font-bold text-blue-900">Session #<span id="active-session-number">--</span> Active</div>
                      <div class="text-sm text-blue-700">Project: <span id="active-project-name">--</span></div>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <button id="btn-view-active-session" class="btn btn-secondary text-sm">
                      <i class="fas fa-eye mr-1"></i>View Details
                    </button>
                    <button id="btn-complete-session" class="btn btn-primary text-sm">
                      <i class="fas fa-check mr-1"></i>Complete Session
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Sessions Timeline View */}
              <div id="sessions-timeline" class="mb-6">
                {/* Populated by JavaScript */}
              </div>
              
              {/* Sessions List */}
              <div id="sessions-list" class="space-y-4">
                {/* Will be populated by JavaScript */}
              </div>
            </div>

            {/* Handoff Tab */}
            <div id="tab-handoff" class="tab-content">
              <h3 class="text-xl font-bold mb-4">🔄 AI-Powered Context Handoff Generator</h3>
              
              {/* AI Feature Notice */}
              <div class="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-4">
                <div class="flex items-start gap-3">
                  <i class="fas fa-robot text-purple-600 text-2xl mt-1"></i>
                  <div class="flex-1">
                    <h4 class="font-bold text-purple-900 mb-1">🚀 AI-Powered Handoff (GAME CHANGER!)</h4>
                    <p class="text-sm text-purple-800 mb-2">
                      Use Hugging Face LLM for intelligent context compression dengan 98%+ preservation rate!
                      Generate master prompt architect dalam 30 detik vs 20 menit manual.
                    </p>
                    <div class="flex items-center gap-2 text-xs text-purple-700">
                      <span class="bg-purple-100 px-2 py-1 rounded">✅ Zero context loss</span>
                      <span class="bg-purple-100 px-2 py-1 rounded">⚡ 30x faster</span>
                      <span class="bg-purple-100 px-2 py-1 rounded">🧠 AI intelligence</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="card">
                <form id="form-handoff" class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
                    <select id="handoff-project" class="w-full border rounded-lg px-4 py-2" required>
                      <option value="">-- Select Project --</option>
                    </select>
                  </div>
                  
                  {/* AI Mode Toggle */}
                  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <label class="flex items-center cursor-pointer">
                      <input type="checkbox" id="handoff-use-ai" class="w-5 h-5 text-blue-600 rounded mr-3" />
                      <div class="flex-1">
                        <span class="font-bold text-blue-900">🤖 Enable AI-Powered Handoff (Recommended)</span>
                        <p class="text-xs text-blue-700 mt-1">
                          Uses Hugging Face LLM for intelligent compression & master prompt generation
                        </p>
                      </div>
                    </label>
                    
                    {/* HF Token Input (hidden by default) */}
                    <div id="hf-token-container" class="mt-3 hidden" style="display: none;">
                      <label class="block text-sm font-medium text-blue-900 mb-2">
                        Hugging Face API Token
                        <a href="https://huggingface.co/settings/tokens" target="_blank" class="ml-2 text-xs text-blue-600 hover:underline">
                          (Get token here <i class="fas fa-external-link-alt text-xs"></i>)
                        </a>
                      </label>
                      <input 
                        type="password" 
                        id="handoff-hf-token" 
                        class="w-full border border-blue-300 rounded-lg px-4 py-2 font-mono text-sm"
                        placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" 
                      />
                      <p class="text-xs text-blue-600 mt-1">
                        <i class="fas fa-lock mr-1"></i>Token disimpan lokal di browser Anda (aman & private)
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Current Session Context
                      <span class="text-xs text-gray-500 ml-2">(Paste full conversation atau describe apa yang sudah dilakukan)</span>
                    </label>
                    <textarea id="handoff-context" class="w-full border rounded-lg px-4 py-3 font-mono text-sm" rows={10} 
                      placeholder="Format bebas! AI akan parse otomatis.&#10;&#10;Contoh:&#10;User: Build API endpoints&#10;AI: I'll create REST endpoints...&#10;&#10;Atau paste conversation langsung dari chat window."></textarea>
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
                  
                  <button type="submit" class="btn btn-primary w-full py-3 text-lg font-bold">
                    <i class="fas fa-magic mr-2"></i>Generate AI-Powered Handoff
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

// ============================================================================
// PRIVATE FEATURES - ADVANCED ORCHESTRATION
// ============================================================================

// Auto-select best account based on credits and specialization
app.post('/api/private/select-best-account', async (c) => {
  const { env } = c
  const { specialization, min_credits } = await c.req.json()
  
  let query = `
    SELECT id, account_name, credits_available, specialization, platform
    FROM accounts
    WHERE status IN ('available', 'active')
      AND credits_available >= ?
  `
  const bindings: any[] = [min_credits || 50]
  
  if (specialization) {
    query += ` AND (specialization LIKE ? OR specialization IS NULL)`
    bindings.push(`%${specialization}%`)
  }
  
  query += ` ORDER BY credits_available DESC, updated_at ASC LIMIT 1`
  
  const result = await env.DB.prepare(query).bind(...bindings).first()
  
  if (!result) {
    return c.json({ 
      success: false, 
      error: 'No available accounts with sufficient credits',
      suggestion: 'Use backup accounts or wait for credit refresh'
    }, 404)
  }
  
  return c.json({ success: true, data: result })
})

// Auto-rotate to next account when credits exhausted
app.post('/api/private/auto-rotate', async (c) => {
  const { env } = c
  const { current_account_id, project_id } = await c.req.json()
  
  // Mark current as exhausted
  await env.DB.prepare(`
    UPDATE accounts SET status = 'exhausted', updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(current_account_id).run()
  
  // Find next best account
  const nextAccount = await env.DB.prepare(`
    SELECT id, account_name, credits_available, specialization
    FROM accounts
    WHERE status = 'available' AND credits_available >= 50 AND id != ?
    ORDER BY credits_available DESC LIMIT 1
  `).bind(current_account_id).first()
  
  if (!nextAccount) {
    return c.json({
      success: false,
      error: 'No available accounts for rotation'
    }, 404)
  }
  
  // Get project and session info
  const [project, latestSession] = await Promise.all([
    env.DB.prepare(`SELECT name FROM projects WHERE id = ?`).bind(project_id).first(),
    env.DB.prepare(`
      SELECT session_number, accomplishments, blockers
      FROM sessions WHERE project_id = ? AND account_id = ?
      ORDER BY started_at DESC LIMIT 1
    `).bind(project_id, current_account_id).first()
  ])
  
  const briefing = `# 🔄 AUTO-ROTATION HANDOFF - ${project?.name}

**Previous Account**: Account #${current_account_id} (exhausted)
**New Account**: ${nextAccount.account_name} (${nextAccount.credits_available} credits)

## ✅ Last Accomplishments
${latestSession?.accomplishments || 'Check previous sessions'}

## 🚧 Blockers
${latestSession?.blockers || 'None'}

---
*Auto-generated by PRIVATE ORCHESTRATOR*`
  
  return c.json({
    success: true,
    next_account: nextAccount,
    briefing
  })
})

// Credit usage analysis
app.post('/api/private/analyze-credits', async (c) => {
  const { env } = c
  const { project_id, days } = await c.req.json()
  
  const stats = await env.DB.prepare(`
    SELECT 
      COUNT(*) as total_sessions,
      SUM(credits_used) as total_credits,
      AVG(credits_used) as avg_credits_per_session,
      MIN(credits_used) as min_credits,
      MAX(credits_used) as max_credits
    FROM sessions
    WHERE project_id = ?
      AND started_at >= datetime('now', '-' || ? || ' days')
  `).bind(project_id, days || 30).first()
  
  const avgCredits = Number(stats?.avg_credits_per_session) || 0
  const efficiency = avgCredits >= 85 && avgCredits <= 92 ? 'optimal' :
                     avgCredits >= 75 && avgCredits < 85 ? 'good' : 'needs_improvement'
  
  const recommendations = []
  if (avgCredits < 60) recommendations.push('Aim for 85-92 credit range per session')
  if (avgCredits > 95) recommendations.push('Consider earlier handoffs')
  if (efficiency === 'optimal') recommendations.push('Excellent! Keep this pattern')
  
  return c.json({
    success: true,
    data: { ...stats, efficiency_score: efficiency, recommendations }
  })
})

// Smart context compression
app.post('/api/private/smart-compress', async (c) => {
  const { env } = c
  const { project_id, context, compress_level } = await c.req.json()
  
  const level = compress_level || 'medium'
  
  const project = await env.DB.prepare(`
    SELECT name FROM projects WHERE id = ?
  `).bind(project_id).first()
  
  const lines = context.split('\n').filter((l: string) => l.trim())
  
  let keyPoints: string[]
  switch (level) {
    case 'high':
      keyPoints = lines.filter((l: string) => 
        l.includes('✅') || l.includes('⚠️') || 
        l.toLowerCase().includes('important')
      ).slice(0, 5)
      break
    case 'low':
      keyPoints = lines.slice(0, 25)
      break
    default:
      keyPoints = lines.filter((l: string) => l.length > 20).slice(0, 15)
  }
  
  const compressionRatio = Math.round((1 - keyPoints.length / lines.length) * 100)
  
  const briefing = `# 🎯 SMART COMPRESSED - ${project?.name}

**Level**: ${level.toUpperCase()} | **Ratio**: ${compressionRatio}%

## 📝 Key Points
${keyPoints.join('\n')}

---
*Smart Compression by PRIVATE ORCHESTRATOR*`
  
  return c.json({
    success: true,
    briefing,
    stats: {
      original_lines: lines.length,
      compressed_lines: keyPoints.length,
      compression_ratio: compressionRatio
    }
  })
})

// Batch create accounts
app.post('/api/private/batch-create-accounts', async (c) => {
  const { env } = c
  const { accounts } = await c.req.json()
  
  const results = []
  for (const account of accounts) {
    const result = await env.DB.prepare(`
      INSERT INTO accounts (account_name, account_email, platform, specialization, status)
      VALUES (?, ?, ?, ?, 'available')
    `).bind(
      account.account_name,
      account.account_email || null,
      account.platform || 'genspark',
      account.specialization || null
    ).run()
    
    results.push({ 
      name: account.account_name, 
      id: result.meta.last_row_id
    })
  }
  
  return c.json({
    success: true,
    message: `Created ${results.length} accounts`,
    accounts: results
  })
})

// Export project data
app.post('/api/private/export-project', async (c) => {
  const { env } = c
  const { project_id } = await c.req.json()
  
  const [project, sessions, files] = await Promise.all([
    env.DB.prepare(`SELECT * FROM projects WHERE id = ?`).bind(project_id).first(),
    env.DB.prepare(`SELECT * FROM sessions WHERE project_id = ? ORDER BY started_at DESC`).bind(project_id).all(),
    env.DB.prepare(`SELECT * FROM project_files WHERE project_id = ?`).bind(project_id).all()
  ])
  
  const exportData = {
    project,
    sessions: sessions.results,
    files: files.results,
    exported_at: new Date().toISOString()
  }
  
  return c.json({
    success: true,
    data: exportData
  })
})

// ============================================================================
// AI-POWERED HANDOFF - GAME CHANGER FEATURES
// ============================================================================

/**
 * 🔥 AI-POWERED HANDOFF GENERATION
 * Uses Hugging Face LLM untuk generate master prompt architect
 */
app.post('/api/ai/handoff', async (c) => {
  try {
    const { project_id, conversation_history, hugging_face_token, relevant_docs } = await c.req.json()
    const { env } = c
    
    if (!hugging_face_token) {
      return c.json({
        success: false,
        error: 'Hugging Face API token required',
        message: 'Provide your HF token untuk enable AI-powered handoff'
      }, 400)
    }
    
    // Get project details
    const project = await env.DB.prepare(`
      SELECT id, name, description, status FROM projects WHERE id = ?
    `).bind(project_id).first() as any
    
    if (!project) {
      return c.json({
        success: false,
        error: 'Project not found'
      }, 404)
    }
    
    // Get latest session for context
    const latestSession = await env.DB.prepare(`
      SELECT session_number, accomplishments, blockers 
      FROM sessions 
      WHERE project_id = ? 
      ORDER BY started_at DESC 
      LIMIT 1
    `).bind(project_id).first() as any
    
    // Get conversation history from database if not provided
    let conversationTurns = conversation_history || []
    
    if (!conversation_history && latestSession) {
      const dbConversations = await env.DB.prepare(`
        SELECT role, content, timestamp
        FROM conversation_history
        WHERE session_id = (
          SELECT id FROM sessions 
          WHERE project_id = ? 
          ORDER BY started_at DESC 
          LIMIT 1
        )
        ORDER BY turn_number ASC
      `).bind(project_id).all()
      
      conversationTurns = dbConversations.results
    }
    
    // Build project context for AI
    const projectContext: ProjectContext = {
      projectId: project.id,
      projectName: project.name,
      projectDescription: project.description || '',
      conversationHistory: conversationTurns,
      sessionNumber: (latestSession?.session_number || 0) + 1,
      lastAccomplishments: latestSession?.accomplishments,
      currentBlockers: latestSession?.blockers,
      relevantDocs: relevant_docs || []
    }
    
    // Generate AI-powered handoff
    const aiResult = await generateAIHandoff(projectContext, {
      apiKey: hugging_face_token
    })
    
    // Store compressed context in database
    if (latestSession) {
      await env.DB.prepare(`
        INSERT INTO context_snapshots 
        (session_id, snapshot_type, compressed_context, context_summary)
        VALUES (
          (SELECT id FROM sessions WHERE project_id = ? ORDER BY started_at DESC LIMIT 1),
          'handoff',
          ?,
          ?
        )
      `).bind(
        project_id,
        aiResult.masterPrompt,
        `AI-generated handoff (confidence: ${aiResult.confidence})`
      ).run()
    }
    
    return c.json({
      success: true,
      data: {
        master_prompt: aiResult.masterPrompt,
        compressed_context: aiResult.compressedContext,
        next_steps: aiResult.nextSteps,
        troubleshooting_notes: aiResult.troubleshootingNotes,
        confidence: aiResult.confidence,
        project: project.name,
        session: projectContext.sessionNumber
      },
      message: `✨ AI-powered handoff generated (${Math.round(aiResult.confidence * 100)}% confidence)`
    })
    
  } catch (error: any) {
    console.error('AI Handoff Error:', error)
    return c.json({
      success: false,
      error: error.message || 'Failed to generate AI handoff',
      suggestion: 'Check your Hugging Face token dan try again'
    }, 500)
  }
})

/**
 * 🔧 AI-POWERED TROUBLESHOOTING
 * Generate fix & resolve prompts dari error context
 */
app.post('/api/ai/troubleshoot', async (c) => {
  try {
    const { 
      project_id, 
      error_message, 
      stack_trace, 
      code_snippet,
      hugging_face_token 
    } = await c.req.json()
    const { env } = c
    
    if (!hugging_face_token) {
      return c.json({
        success: false,
        error: 'Hugging Face API token required'
      }, 400)
    }
    
    if (!error_message) {
      return c.json({
        success: false,
        error: 'error_message is required'
      }, 400)
    }
    
    // Get project context
    const project = await env.DB.prepare(`
      SELECT id, name, description FROM projects WHERE id = ?
    `).bind(project_id).first() as any
    
    if (!project) {
      return c.json({
        success: false,
        error: 'Project not found'
      }, 404)
    }
    
    const projectContext: ProjectContext = {
      projectId: project.id,
      projectName: project.name,
      projectDescription: project.description || '',
      conversationHistory: [],
      sessionNumber: 0
    }
    
    // Generate troubleshooting prompt
    const troubleshootingPrompt = await generateTroubleshootingPrompt(
      {
        errorMessage: error_message,
        stackTrace: stack_trace,
        codeSnippet: code_snippet,
        environment: 'Cloudflare Pages + Hono + D1'
      },
      projectContext,
      {
        apiKey: hugging_face_token
      }
    )
    
    return c.json({
      success: true,
      data: {
        troubleshooting_prompt: troubleshootingPrompt,
        error_context: error_message
      },
      message: '🔧 Troubleshooting prompt generated'
    })
    
  } catch (error: any) {
    console.error('Troubleshooting Error:', error)
    return c.json({
      success: false,
      error: error.message || 'Failed to generate troubleshooting prompt'
    }, 500)
  }
})

/**
 * 💾 SAVE CONVERSATION TO DATABASE
 * Store conversation history untuk future reference
 */
app.post('/api/ai/save-conversation', async (c) => {
  try {
    const { project_id, account_id, conversation } = await c.req.json()
    const { env } = c
    
    if (!conversation || conversation.length === 0) {
      return c.json({
        success: false,
        error: 'conversation array is required'
      }, 400)
    }
    
    // Get or create current session
    let session = await env.DB.prepare(`
      SELECT id FROM sessions 
      WHERE project_id = ? AND account_id = ? AND status = 'in_progress'
      ORDER BY started_at DESC 
      LIMIT 1
    `).bind(project_id, account_id).first() as any
    
    if (!session) {
      // Create new session
      const sessionNumber = await env.DB.prepare(`
        SELECT COUNT(*) as count FROM sessions WHERE project_id = ?
      `).bind(project_id).first() as any
      
      const newSession = await env.DB.prepare(`
        INSERT INTO sessions (project_id, account_id, session_number, status)
        VALUES (?, ?, ?, 'in_progress')
      `).bind(project_id, account_id, (sessionNumber?.count || 0) + 1).run()
      
      session = { id: newSession.meta.last_row_id }
    }
    
    // Save conversation turns
    for (let i = 0; i < conversation.length; i++) {
      const turn = conversation[i]
      await env.DB.prepare(`
        INSERT INTO conversation_history 
        (session_id, turn_number, role, content, timestamp)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(
        session.id,
        i + 1,
        turn.role,
        turn.content
      ).run()
    }
    
    return c.json({
      success: true,
      message: `Saved ${conversation.length} conversation turns`,
      session_id: session.id
    })
    
  } catch (error: any) {
    console.error('Save Conversation Error:', error)
    return c.json({
      success: false,
      error: error.message || 'Failed to save conversation'
    }, 500)
  }
})

/**
 * 📚 GET CONVERSATION HISTORY
 * Retrieve stored conversations untuk context
 */
app.get('/api/ai/conversations/:project_id', async (c) => {
  try {
    const { env } = c
    const projectId = c.req.param('project_id')
    const limit = c.req.query('limit') || '50'
    
    const conversations = await env.DB.prepare(`
      SELECT 
        ch.id,
        ch.turn_number,
        ch.role,
        ch.content,
        ch.timestamp,
        s.session_number,
        s.id as session_id
      FROM conversation_history ch
      JOIN sessions s ON ch.session_id = s.id
      WHERE s.project_id = ?
      ORDER BY ch.timestamp DESC
      LIMIT ?
    `).bind(projectId, parseInt(limit)).all()
    
    return c.json({
      success: true,
      data: conversations.results
    })
    
  } catch (error: any) {
    console.error('Get Conversations Error:', error)
    return c.json({
      success: false,
      error: error.message || 'Failed to get conversations'
    }, 500)
  }
})

// ============================================================================
// SESSION ORCHESTRATION - GAME CHANGER: MULTI-SESSION MANAGEMENT
// ============================================================================

/**
 * 🔄 GET SESSION DETAILS WITH HANDOFF
 * Get complete session info including previous handoff briefing
 */
app.get('/api/sessions/:session_id/detail', async (c) => {
  try {
    const { env } = c
    const sessionId = c.req.param('session_id')
    
    // Get session details
    const session = await env.DB.prepare(`
      SELECT 
        s.*,
        p.name as project_name,
        p.description as project_description,
        a.account_name
      FROM sessions s
      JOIN projects p ON s.project_id = p.id
      JOIN accounts a ON s.account_id = a.id
      WHERE s.id = ?
    `).bind(sessionId).first() as any
    
    if (!session) {
      return c.json({
        success: false,
        error: 'Session not found'
      }, 404)
    }
    
    // Get previous session handoff
    const previousHandoff = await env.DB.prepare(`
      SELECT compressed_context, context_summary, created_at
      FROM context_snapshots
      WHERE session_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `).bind(sessionId).first() as any
    
    // Get conversation history for this session
    const conversations = await env.DB.prepare(`
      SELECT role, content, timestamp, turn_number
      FROM conversation_history
      WHERE session_id = ?
      ORDER BY turn_number ASC
    `).bind(sessionId).all()
    
    return c.json({
      success: true,
      data: {
        session,
        previous_handoff: previousHandoff,
        conversations: conversations.results
      }
    })
    
  } catch (error: any) {
    console.error('Get Session Detail Error:', error)
    return c.json({
      success: false,
      error: error.message || 'Failed to get session details'
    }, 500)
  }
})

/**
 * 🎯 CREATE NEW SESSION WITH AUTO-LOAD HANDOFF
 * Creates new session and loads previous session's handoff automatically
 */
app.post('/api/sessions/create-with-handoff', async (c) => {
  try {
    const { env } = c
    const { project_id, account_id, objectives } = await c.req.json()
    
    if (!project_id || !account_id) {
      return c.json({
        success: false,
        error: 'project_id and account_id are required'
      }, 400)
    }
    
    // Get next session number
    const countResult = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM sessions WHERE project_id = ?
    `).bind(project_id).first() as any
    
    const sessionNumber = (countResult?.count || 0) + 1
    
    // Create new session
    const newSession = await env.DB.prepare(`
      INSERT INTO sessions (project_id, account_id, session_number, objectives, status)
      VALUES (?, ?, ?, ?, 'in_progress')
    `).bind(project_id, account_id, sessionNumber, objectives || '').run()
    
    const sessionId = newSession.meta.last_row_id
    
    // Get previous session's handoff (if exists)
    const previousHandoff = await env.DB.prepare(`
      SELECT cs.compressed_context, cs.context_summary, s.session_number
      FROM context_snapshots cs
      JOIN sessions s ON cs.session_id = s.id
      WHERE s.project_id = ? AND s.session_number = ?
      ORDER BY cs.created_at DESC
      LIMIT 1
    `).bind(project_id, sessionNumber - 1).first() as any
    
    // Get project details
    const project = await env.DB.prepare(`
      SELECT name, description FROM projects WHERE id = ?
    `).bind(project_id).first() as any
    
    return c.json({
      success: true,
      data: {
        session_id: sessionId,
        session_number: sessionNumber,
        project_name: project?.name,
        previous_handoff: previousHandoff,
        message: previousHandoff 
          ? `✨ Session #${sessionNumber} created! Previous handoff loaded.`
          : `🎯 Session #${sessionNumber} created! (First session, no handoff yet)`
      }
    })
    
  } catch (error: any) {
    console.error('Create Session Error:', error)
    return c.json({
      success: false,
      error: error.message || 'Failed to create session'
    }, 500)
  }
})

/**
 * ⚡ COMPLETE SESSION & AUTO-GENERATE HANDOFF
 * Marks session as completed and automatically generates handoff for next session
 */
app.post('/api/sessions/:session_id/complete', async (c) => {
  try {
    const { env } = c
    const sessionId = c.req.param('session_id')
    const { 
      credits_used, 
      accomplishments, 
      blockers, 
      hugging_face_token,
      auto_generate_handoff 
    } = await c.req.json()
    
    // Update session as completed
    await env.DB.prepare(`
      UPDATE sessions 
      SET 
        status = 'completed',
        credits_used = ?,
        accomplishments = ?,
        blockers = ?,
        completed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      credits_used || 0,
      accomplishments || '',
      blockers || '',
      sessionId
    ).run()
    
    // Get session and project details
    const session = await env.DB.prepare(`
      SELECT s.*, p.name as project_name, p.description as project_description
      FROM sessions s
      JOIN projects p ON s.project_id = p.id
      WHERE s.id = ?
    `).bind(sessionId).first() as any
    
    let handoffGenerated = false
    let masterPrompt = null
    
    // Auto-generate handoff if requested and token provided
    if (auto_generate_handoff && hugging_face_token) {
      try {
        // Get conversation history
        const conversations = await env.DB.prepare(`
          SELECT role, content
          FROM conversation_history
          WHERE session_id = ?
          ORDER BY turn_number ASC
        `).bind(sessionId).all()
        
        // Build project context
        const projectContext: ProjectContext = {
          projectId: session.project_id,
          projectName: session.project_name,
          projectDescription: session.project_description || '',
          conversationHistory: conversations.results as ConversationTurn[],
          sessionNumber: session.session_number,
          lastAccomplishments: accomplishments,
          currentBlockers: blockers
        }
        
        // Generate AI handoff
        const aiResult = await generateAIHandoff(projectContext, {
          apiKey: hugging_face_token
        })
        
        // Store handoff in database
        await env.DB.prepare(`
          INSERT INTO context_snapshots 
          (session_id, snapshot_type, compressed_context, context_summary)
          VALUES (?, 'handoff', ?, ?)
        `).bind(
          sessionId,
          aiResult.masterPrompt,
          `AI-generated handoff for Session #${session.session_number} (confidence: ${aiResult.confidence})`
        ).run()
        
        handoffGenerated = true
        masterPrompt = aiResult.masterPrompt
        
      } catch (error: any) {
        console.error('Auto-generate handoff error:', error)
        // Continue even if handoff generation fails
      }
    }
    
    // Update project stats
    await env.DB.prepare(`
      UPDATE projects 
      SET 
        total_credits_used = total_credits_used + ?,
        total_sessions = total_sessions + 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(credits_used || 0, session.project_id).run()
    
    return c.json({
      success: true,
      data: {
        session_id: sessionId,
        session_number: session.session_number,
        handoff_generated: handoffGenerated,
        master_prompt: masterPrompt,
        message: handoffGenerated
          ? `✅ Session #${session.session_number} completed! Handoff generated for next session.`
          : `✅ Session #${session.session_number} completed!`
      }
    })
    
  } catch (error: any) {
    console.error('Complete Session Error:', error)
    return c.json({
      success: false,
      error: error.message || 'Failed to complete session'
    }, 500)
  }
})

/**
 * 📊 GET PROJECT SESSIONS TIMELINE
 * Get all sessions for a project with their handoffs
 */
app.get('/api/projects/:project_id/sessions-timeline', async (c) => {
  try {
    const { env } = c
    const projectId = c.req.param('project_id')
    
    const sessions = await env.DB.prepare(`
      SELECT 
        s.id,
        s.session_number,
        s.credits_used,
        s.status,
        s.accomplishments,
        s.blockers,
        s.started_at,
        s.completed_at,
        a.account_name,
        (SELECT COUNT(*) FROM conversation_history WHERE session_id = s.id) as conversation_count,
        (SELECT COUNT(*) FROM context_snapshots WHERE session_id = s.id) as handoff_count
      FROM sessions s
      JOIN accounts a ON s.account_id = a.id
      WHERE s.project_id = ?
      ORDER BY s.session_number ASC
    `).bind(projectId).all()
    
    return c.json({
      success: true,
      data: sessions.results
    })
    
  } catch (error: any) {
    console.error('Get Sessions Timeline Error:', error)
    return c.json({
      success: false,
      error: error.message || 'Failed to get sessions timeline'
    }, 500)
  }
})

export default app
