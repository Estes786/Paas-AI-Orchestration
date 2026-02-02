// Multi-Account Context Orchestrator - Frontend Logic
// Created: 2026-01-30

// ============================================================================
// GLOBAL STATE
// ============================================================================
let state = {
  projects: [],
  accounts: [],
  sessions: [],
  knowledge: [],
  currentTab: 'dashboard',
  hfToken: localStorage.getItem('hf_token') || ''
}

// ============================================================================
// INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Multi-Account Orchestrator initialized')
  
  // Setup tab navigation
  setupTabNavigation()
  
  // Setup event listeners
  setupEventListeners()
  
  // Load initial data
  await loadInitialData()
})

// ============================================================================
// TAB NAVIGATION
// ============================================================================
function setupTabNavigation() {
  const tabButtons = document.querySelectorAll('.tab-button')
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabName = button.getAttribute('data-tab')
      switchTab(tabName)
    })
  })
}

function switchTab(tabName) {
  // Update buttons
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active')
  })
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active')
  
  // Update content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active')
  })
  document.getElementById(`tab-${tabName}`).classList.add('active')
  
  state.currentTab = tabName
  
  // Load tab-specific data
  loadTabData(tabName)
}

// ============================================================================
// DATA LOADING
// ============================================================================
async function loadInitialData() {
  try {
    // Load stats for header
    const statsResponse = await axios.get('/api/stats')
    if (statsResponse.data.success) {
      const stats = statsResponse.data.data
      document.getElementById('total-projects').textContent = stats.active_projects
      document.getElementById('active-accounts').textContent = stats.active_accounts
      document.getElementById('stat-credits').textContent = stats.total_credits
      document.getElementById('stat-sessions').textContent = stats.total_sessions
    }
    
    // Load initial tab data
    await loadTabData('dashboard')
  } catch (error) {
    console.error('Error loading initial data:', error)
    showAlert('error', 'Failed to load initial data')
  }
}

async function loadTabData(tabName) {
  switch (tabName) {
    case 'projects':
      await loadProjects()
      break
    case 'accounts':
      await loadAccounts()
      break
    case 'sessions':
      await loadSessions()
      break
    case 'handoff':
      await loadHandoffData()
      break
    case 'knowledge':
      await loadKnowledge()
      break
  }
}

async function loadProjects() {
  try {
    const response = await axios.get('/api/projects')
    if (response.data.success) {
      state.projects = response.data.data
      renderProjects()
    }
  } catch (error) {
    console.error('Error loading projects:', error)
    showAlert('error', 'Failed to load projects')
  }
}

async function loadAccounts() {
  try {
    const response = await axios.get('/api/accounts')
    if (response.data.success) {
      state.accounts = response.data.data
      renderAccounts()
    }
  } catch (error) {
    console.error('Error loading accounts:', error)
    showAlert('error', 'Failed to load accounts')
  }
}

async function loadSessions() {
  try {
    const projectId = document.getElementById('filter-project')?.value
    const accountId = document.getElementById('filter-account')?.value
    
    let url = '/api/sessions'
    const params = new URLSearchParams()
    if (projectId) params.append('project_id', projectId)
    if (accountId) params.append('account_id', accountId)
    if (params.toString()) url += '?' + params.toString()
    
    const response = await axios.get(url)
    if (response.data.success) {
      state.sessions = response.data.data
      renderSessions()
    }
  } catch (error) {
    console.error('Error loading sessions:', error)
    showAlert('error', 'Failed to load sessions')
  }
}

async function loadHandoffData() {
  try {
    // Load projects for dropdown
    const projectsResponse = await axios.get('/api/projects')
    if (projectsResponse.data.success) {
      const select = document.getElementById('handoff-project')
      select.innerHTML = '<option value="">-- Select Project --</option>'
      projectsResponse.data.data.forEach(project => {
        const option = document.createElement('option')
        option.value = project.id
        option.textContent = project.name
        select.appendChild(option)
      })
    }
    
    // Load accounts for dropdown
    const accountsResponse = await axios.get('/api/accounts')
    if (accountsResponse.data.success) {
      const select = document.getElementById('handoff-from-account')
      select.innerHTML = '<option value="">-- Select Account --</option>'
      accountsResponse.data.data.forEach(account => {
        const option = document.createElement('option')
        option.value = account.id
        option.textContent = account.account_name
        select.appendChild(option)
      })
    }
  } catch (error) {
    console.error('Error loading handoff data:', error)
  }
}

async function loadKnowledge() {
  try {
    const response = await axios.get('/api/knowledge')
    if (response.data.success) {
      state.knowledge = response.data.data
      renderKnowledge()
    }
  } catch (error) {
    console.error('Error loading knowledge:', error)
    showAlert('error', 'Failed to load knowledge base')
  }
}

// ============================================================================
// RENDERING
// ============================================================================
function renderProjects() {
  const container = document.getElementById('projects-list')
  
  if (state.projects.length === 0) {
    container.innerHTML = '<div class="alert alert-info"><i class="fas fa-info-circle mr-2"></i>No projects yet. Create your first project!</div>'
    return
  }
  
  container.innerHTML = state.projects.map(project => `
    <div class="project-card ${project.status}">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <h4 class="text-lg font-bold text-gray-900 mb-2">${project.name}</h4>
          <p class="text-sm text-gray-600 mb-3">${project.description || 'No description'}</p>
          <div class="flex items-center gap-4">
            <span class="badge badge-blue">
              <i class="fas fa-coins mr-1"></i>${project.total_credits_used} credits
            </span>
            <span class="badge badge-green">
              <i class="fas fa-history mr-1"></i>${project.total_sessions} sessions
            </span>
            <span class="badge badge-${getStatusColor(project.status)}">${project.status}</span>
          </div>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-secondary" onclick="viewProject(${project.id})">
            <i class="fas fa-eye"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('')
}

function renderAccounts() {
  const container = document.getElementById('accounts-list')
  
  if (state.accounts.length === 0) {
    container.innerHTML = '<div class="alert alert-info"><i class="fas fa-info-circle mr-2"></i>No accounts yet. Add your first account!</div>'
    return
  }
  
  container.innerHTML = state.accounts.map(account => `
    <div class="account-card ${account.status}">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
          ${account.account_name.charAt(0)}
        </div>
        <div class="flex-1">
          <h5 class="font-bold text-gray-900">${account.account_name}</h5>
          <p class="text-sm text-gray-500">${account.platform} • ${account.specialization || 'General'}</p>
        </div>
        <div class="text-right">
          <p class="text-sm text-gray-500">Credits Available</p>
          <p class="text-xl font-bold ${account.credits_available < 20 ? 'text-red-600' : 'text-green-600'}">
            ${account.credits_available}
          </p>
        </div>
        <span class="badge badge-${getStatusColor(account.status)}">${account.status}</span>
      </div>
    </div>
  `).join('')
}

function renderSessions() {
  const container = document.getElementById('sessions-list')
  
  if (state.sessions.length === 0) {
    container.innerHTML = '<div class="alert alert-info"><i class="fas fa-info-circle mr-2"></i>No sessions recorded yet.</div>'
    return
  }
  
  container.innerHTML = state.sessions.map(session => `
    <div class="card">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <h5 class="text-lg font-bold text-gray-900">${session.project_name}</h5>
            <span class="badge badge-blue">Session #${session.session_number}</span>
            <span class="badge badge-purple">${session.session_type}</span>
          </div>
          <p class="text-sm text-gray-600 mb-2">
            <i class="fas fa-user mr-1"></i>${session.account_name}
          </p>
          <div class="flex items-center gap-4 text-sm text-gray-500">
            <span><i class="fas fa-coins mr-1"></i>${session.credits_used || 0} credits</span>
            <span><i class="fas fa-clock mr-1"></i>${session.duration_minutes || 0} min</span>
            <span><i class="fas fa-calendar mr-1"></i>${formatDate(session.started_at)}</span>
          </div>
        </div>
        <span class="badge badge-${getStatusColor(session.status)}">${session.status}</span>
      </div>
    </div>
  `).join('')
}

function renderKnowledge() {
  const container = document.getElementById('knowledge-list')
  
  if (state.knowledge.length === 0) {
    container.innerHTML = '<div class="alert alert-info"><i class="fas fa-info-circle mr-2"></i>No knowledge entries yet.</div>'
    return
  }
  
  const categories = {
    pattern: { icon: 'fas fa-puzzle-piece', color: 'blue' },
    error_solution: { icon: 'fas fa-bug', color: 'red' },
    optimization: { icon: 'fas fa-rocket', color: 'green' },
    best_practice: { icon: 'fas fa-star', color: 'yellow' },
    tip: { icon: 'fas fa-lightbulb', color: 'purple' }
  }
  
  container.innerHTML = state.knowledge.map(item => {
    const cat = categories[item.category] || { icon: 'fas fa-book', color: 'gray' }
    return `
      <div class="card">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-lg bg-${cat.color}-100 flex items-center justify-center">
            <i class="${cat.icon} text-${cat.color}-600"></i>
          </div>
          <div class="flex-1">
            <div class="flex items-start justify-between mb-2">
              <h5 class="font-bold text-gray-900">${item.title}</h5>
              <span class="badge badge-${cat.color}">${item.category.replace('_', ' ')}</span>
            </div>
            <p class="text-sm text-gray-600 mb-3">${item.description}</p>
            <div class="flex items-center gap-4 text-sm text-gray-500">
              <span><i class="fas fa-check-circle mr-1"></i>${Math.round(item.success_rate * 100)}% success</span>
              <span><i class="fas fa-redo mr-1"></i>Used ${item.usage_count} times</span>
            </div>
          </div>
        </div>
      </div>
    `
  }).join('')
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================
function setupEventListeners() {
  // New project button
  const btnNewProject = document.getElementById('btn-new-project')
  if (btnNewProject) {
    btnNewProject.addEventListener('click', () => {
      createProject()
    })
  }
  
  // New account button
  const btnNewAccount = document.getElementById('btn-new-account')
  if (btnNewAccount) {
    btnNewAccount.addEventListener('click', () => {
      createAccount()
    })
  }
  
  // Handoff form
  const formHandoff = document.getElementById('form-handoff')
  if (formHandoff) {
    formHandoff.addEventListener('submit', async (e) => {
      e.preventDefault()
      await generateHandoff()
    })
  }
  
  // Copy briefing button
  const btnCopy = document.getElementById('btn-copy-briefing')
  if (btnCopy) {
    btnCopy.addEventListener('click', () => {
      copyBriefing()
    })
  }
  
  // Download briefing button
  const btnDownload = document.getElementById('btn-download-briefing')
  if (btnDownload) {
    btnDownload.addEventListener('click', () => {
      downloadBriefing()
    })
  }
  
  // AI toggle checkbox
  const aiToggle = document.getElementById('handoff-use-ai')
  if (aiToggle) {
    aiToggle.addEventListener('change', (e) => {
      const tokenContainer = document.getElementById('hf-token-container')
      if (tokenContainer) {
        tokenContainer.style.display = e.target.checked ? 'block' : 'none'
      }
    })
  }
  
  // Prefill HF token if exists
  const hfTokenInput = document.getElementById('handoff-hf-token')
  if (hfTokenInput && state.hfToken) {
    hfTokenInput.value = state.hfToken
  }
}

async function createProject() {
  const name = prompt('Enter project name:')
  if (!name) return
  
  const description = prompt('Enter project description (optional):')
  
  try {
    const response = await axios.post('/api/projects', { name, description })
    if (response.data.success) {
      showAlert('success', 'Project created successfully!')
      await loadProjects()
    }
  } catch (error) {
    console.error('Error creating project:', error)
    showAlert('error', 'Failed to create project')
  }
}

async function createAccount() {
  const account_name = prompt('Enter account name (e.g., Account-01):')
  if (!account_name) return
  
  const platform = prompt('Enter platform (genspark/claude/chatgpt/gemini):') || 'genspark'
  const specialization = prompt('Enter specialization (optional):')
  
  try {
    const response = await axios.post('/api/accounts', { 
      account_name, 
      platform, 
      specialization 
    })
    if (response.data.success) {
      showAlert('success', 'Account added successfully!')
      await loadAccounts()
    }
  } catch (error) {
    console.error('Error creating account:', error)
    showAlert('error', 'Failed to add account')
  }
}

async function generateHandoff() {
  const projectId = document.getElementById('handoff-project').value
  const context = document.getElementById('handoff-context').value
  const credits = document.getElementById('handoff-credits').value
  const fromAccountId = document.getElementById('handoff-from-account').value
  const hfToken = document.getElementById('handoff-hf-token')?.value || state.hfToken
  const useAI = document.getElementById('handoff-use-ai')?.checked
  
  if (!projectId || !context) {
    showAlert('error', 'Please fill in project and context')
    return
  }
  
  // Show loading
  const submitBtn = document.querySelector('#form-handoff button[type=submit]')
  const originalBtnText = submitBtn.innerHTML
  submitBtn.disabled = true
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Generating...'
  
  try {
    let response
    
    if (useAI && hfToken) {
      // Save token untuk future use
      localStorage.setItem('hf_token', hfToken)
      state.hfToken = hfToken
      
      // Parse conversation history dari context
      const conversationHistory = parseConversationHistory(context)
      
      // Use AI-powered handoff
      response = await axios.post('/api/ai/handoff', {
        project_id: projectId,
        conversation_history: conversationHistory,
        hugging_face_token: hfToken,
        relevant_docs: []
      })
      
      if (response.data.success) {
        const output = document.getElementById('handoff-output')
        const aiData = response.data.data
        
        // Display comprehensive AI result
        output.textContent = `${aiData.master_prompt}\n\n---\n\n${aiData.compressed_context}\n\n## 🎯 Next Steps\n${aiData.next_steps.map((s, i) => `${i+1}. ${s}`).join('\n')}${aiData.troubleshooting_notes ? '\n\n## ⚠️ Troubleshooting Notes\n' + aiData.troubleshooting_notes : ''}\n\n---\n*AI Confidence: ${Math.round(aiData.confidence * 100)}%*`
        
        document.getElementById('handoff-result').classList.remove('hidden')
        showAlert('success', `✨ AI-powered handoff generated! (${Math.round(aiData.confidence * 100)}% confidence)`)
      }
    } else {
      // Use basic compression
      response = await axios.post('/api/handoff/compress', {
        project_id: projectId,
        context: context,
        credits_used: credits,
        from_account_id: fromAccountId
      })
      
      if (response.data.success) {
        const output = document.getElementById('handoff-output')
        output.textContent = response.data.briefing
        document.getElementById('handoff-result').classList.remove('hidden')
        showAlert('success', 'Compressed briefing generated!')
      }
    }
  } catch (error) {
    console.error('Error generating handoff:', error)
    const errorMsg = error.response?.data?.error || 'Failed to generate briefing'
    showAlert('error', errorMsg)
  } finally {
    // Reset button
    submitBtn.disabled = false
    submitBtn.innerHTML = originalBtnText
  }
}

// Parse conversation history from text
function parseConversationHistory(text) {
  const lines = text.split('\n')
  const conversation = []
  
  lines.forEach(line => {
    const userMatch = line.match(/^(?:User|Human|Me):\s*(.+)/i)
    const aiMatch = line.match(/^(?:AI|Assistant|Bot|Claude|ChatGPT):\s*(.+)/i)
    
    if (userMatch) {
      conversation.push({ role: 'user', content: userMatch[1].trim() })
    } else if (aiMatch) {
      conversation.push({ role: 'assistant', content: aiMatch[1].trim() })
    }
  })
  
  // If no structured conversation found, treat entire text as context
  if (conversation.length === 0) {
    conversation.push({ role: 'user', content: text })
  }
  
  return conversation
}

function copyBriefing() {
  const output = document.getElementById('handoff-output')
  navigator.clipboard.writeText(output.textContent)
    .then(() => {
      showAlert('success', 'Briefing copied to clipboard!')
    })
    .catch(err => {
      console.error('Copy failed:', err)
      showAlert('error', 'Failed to copy')
    })
}

function downloadBriefing() {
  const output = document.getElementById('handoff-output')
  const blob = new Blob([output.textContent], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `handoff-briefing-${Date.now()}.txt`
  a.click()
  URL.revokeObjectURL(url)
  showAlert('success', 'Briefing downloaded!')
}

function viewProject(projectId) {
  // TODO: Implement project detail view
  alert('View project details - Coming soon!')
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
function getStatusColor(status) {
  const colors = {
    active: 'blue',
    available: 'green',
    paused: 'yellow',
    completed: 'green',
    archived: 'gray',
    exhausted: 'red',
    blocked: 'red',
    in_progress: 'blue',
    handed_off: 'purple',
    failed: 'red'
  }
  return colors[status] || 'gray'
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

function showAlert(type, message) {
  // Simple alert for now - can be enhanced with toast notifications
  const alertDiv = document.createElement('div')
  alertDiv.className = `alert alert-${type} fixed top-4 right-4 z-50 shadow-lg`
  alertDiv.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} mr-2"></i>
    ${message}
  `
  document.body.appendChild(alertDiv)
  
  setTimeout(() => {
    alertDiv.remove()
  }, 3000)
}

console.log('✅ Frontend app.js loaded successfully')
