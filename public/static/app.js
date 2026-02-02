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
  hfToken: localStorage.getItem('hf_token') || '',
  activeSession: null // Track currently active session
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
  
  // ============================================================================
  // SESSION ORCHESTRATION EVENT LISTENERS
  // ============================================================================
  
  // New session button
  const btnNewSession = document.getElementById('btn-new-session')
  if (btnNewSession) {
    btnNewSession.addEventListener('click', async () => {
      await promptCreateSession()
    })
  }
  
  // View active session button
  const btnViewActive = document.getElementById('btn-view-active-session')
  if (btnViewActive) {
    btnViewActive.addEventListener('click', () => {
      if (state.activeSession) {
        viewSessionDetails(state.activeSession.session_id)
      }
    })
  }
  
  // Complete session button
  const btnCompleteSession = document.getElementById('btn-complete-session')
  if (btnCompleteSession) {
    btnCompleteSession.addEventListener('click', async () => {
      if (state.activeSession) {
        await promptCompleteSession(state.activeSession.session_id)
      }
    })
  }
  
  // Session timeline project filter
  const filterProject = document.getElementById('filter-project')
  if (filterProject) {
    filterProject.addEventListener('change', async (e) => {
      if (e.target.value) {
        await loadSessionTimeline(e.target.value)
      } else {
        document.getElementById('sessions-timeline').innerHTML = ''
      }
    })
  }
}

/**
 * 🎯 PROMPT USER TO CREATE NEW SESSION
 */
async function promptCreateSession() {
  // Show modal to select project and account
  const modal = document.createElement('div')
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
  modal.innerHTML = `
    <div class="bg-white rounded-xl max-w-md w-full p-6">
      <h3 class="text-xl font-bold mb-4">🚀 Create New Session</h3>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
          <select id="new-session-project" class="w-full border rounded-lg px-4 py-2">
            <option value="">-- Select Project --</option>
            ${state.projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Select Account</label>
          <select id="new-session-account" class="w-full border rounded-lg px-4 py-2">
            <option value="">-- Select Account --</option>
            ${state.accounts.filter(a => a.status === 'available' || a.status === 'active').map(a => 
              `<option value="${a.id}">${a.account_name} (${a.credits_available} credits)</option>`
            ).join('')}
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Objectives (optional)</label>
          <textarea id="new-session-objectives" class="w-full border rounded-lg px-4 py-2" rows="3"
                    placeholder="What do you want to accomplish in this session?"></textarea>
        </div>
      </div>
      <div class="mt-6 flex gap-2">
        <button onclick="this.closest('.fixed').remove()" class="btn btn-secondary flex-1">
          Cancel
        </button>
        <button onclick="submitNewSession()" class="btn btn-primary flex-1">
          <i class="fas fa-rocket mr-2"></i>Create Session
        </button>
      </div>
    </div>
  `
  document.body.appendChild(modal)
}

/**
 * ✅ SUBMIT NEW SESSION CREATION
 */
async function submitNewSession() {
  const projectId = document.getElementById('new-session-project').value
  const accountId = document.getElementById('new-session-account').value
  const objectives = document.getElementById('new-session-objectives').value
  
  if (!projectId || !accountId) {
    showAlert('error', 'Please select both project and account')
    return
  }
  
  // Close modal
  document.querySelector('.fixed').remove()
  
  // Create session
  await createNewSessionWithHandoff(projectId, accountId, objectives)
}

/**
 * 📝 PROMPT USER TO COMPLETE SESSION
 */
async function promptCompleteSession(sessionId) {
  const modal = document.createElement('div')
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
  modal.innerHTML = `
    <div class="bg-white rounded-xl max-w-2xl w-full p-6">
      <h3 class="text-xl font-bold mb-4">✅ Complete Session</h3>
      
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <p class="text-sm text-blue-800">
          <i class="fas fa-info-circle mr-2"></i>
          Completing this session will:
          <ul class="list-disc list-inside mt-2 ml-4">
            <li>Mark session as completed</li>
            <li>Update project statistics</li>
            ${localStorage.getItem('hf_token') ? '<li>✨ Auto-generate AI handoff for next session</li>' : '<li>⚠️ No AI handoff (add HF token in Handoff tab)</li>'}
          </ul>
        </p>
      </div>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Credits Used</label>
          <input type="number" id="complete-credits" class="w-full border rounded-lg px-4 py-2" 
                 placeholder="88" min="0" max="100" value="88" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">✅ Accomplishments</label>
          <textarea id="complete-accomplishments" class="w-full border rounded-lg px-4 py-2" rows="4"
                    placeholder="What was completed in this session?"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">🚧 Blockers (optional)</label>
          <textarea id="complete-blockers" class="w-full border rounded-lg px-4 py-2" rows="3"
                    placeholder="Any issues or blockers encountered?"></textarea>
        </div>
      </div>
      
      <div class="mt-6 flex gap-2">
        <button onclick="this.closest('.fixed').remove()" class="btn btn-secondary flex-1">
          Cancel
        </button>
        <button onclick="submitCompleteSession(${sessionId})" class="btn btn-primary flex-1">
          <i class="fas fa-check mr-2"></i>Complete Session
        </button>
      </div>
    </div>
  `
  document.body.appendChild(modal)
}

/**
 * ✅ SUBMIT SESSION COMPLETION
 */
async function submitCompleteSession(sessionId) {
  const creditsUsed = parseInt(document.getElementById('complete-credits').value) || 88
  const accomplishments = document.getElementById('complete-accomplishments').value
  const blockers = document.getElementById('complete-blockers').value
  
  if (!accomplishments.trim()) {
    showAlert('error', 'Please describe what was accomplished')
    return
  }
  
  // Close modal
  document.querySelector('.fixed').remove()
  
  // Complete session
  await completeSessionWithHandoff(sessionId, accomplishments, blockers, creditsUsed)
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
// SESSION ORCHESTRATION - INFINITY GROWTH SYSTEM
// ============================================================================

/**
 * 🎯 CREATE NEW SESSION WITH AUTO-LOAD HANDOFF
 * Creates new session and automatically loads previous session's handoff
 */
async function createNewSessionWithHandoff(projectId, accountId, objectives = '') {
  try {
    showAlert('info', 'Creating new session...')
    
    const response = await axios.post('/api/sessions/create-with-handoff', {
      project_id: projectId,
      account_id: accountId,
      objectives
    })
    
    if (response.data.success) {
      const { session_id, session_number, previous_handoff, message } = response.data.data
      
      showAlert('success', message)
      
      // If there's a previous handoff, show it in a modal
      if (previous_handoff) {
        showHandoffModal(session_number, previous_handoff.compressed_context)
      }
      
      // Store active session in state
      state.activeSession = {
        session_id,
        session_number,
        project_id: projectId,
        account_id: accountId
      }
      
      // Update UI
      updateActiveSessionIndicator()
      await loadSessions()
      
      return session_id
    }
  } catch (error) {
    console.error('Create session error:', error)
    showAlert('error', 'Failed to create session')
  }
}

/**
 * ✅ COMPLETE SESSION & AUTO-GENERATE HANDOFF
 * Completes current session and generates handoff for next session
 */
async function completeSessionWithHandoff(sessionId, accomplishments, blockers, creditsUsed) {
  try {
    const hfToken = localStorage.getItem('hf_token')
    
    if (!hfToken) {
      const userConfirm = confirm(
        '⚠️ No Hugging Face token found!\n\n' +
        'Without token, handoff will be basic. Do you want to:\n' +
        '- Click OK to continue with basic handoff\n' +
        '- Click Cancel to add HF token first (recommended)'
      )
      
      if (!userConfirm) {
        switchTab('handoff')
        return
      }
    }
    
    showAlert('info', hfToken ? 'Completing session & generating AI handoff...' : 'Completing session...')
    
    const response = await axios.post(`/api/sessions/${sessionId}/complete`, {
      credits_used: creditsUsed,
      accomplishments,
      blockers,
      hugging_face_token: hfToken,
      auto_generate_handoff: !!hfToken
    })
    
    if (response.data.success) {
      const { handoff_generated, master_prompt, message } = response.data.data
      
      showAlert('success', message)
      
      // If handoff was generated, show it
      if (handoff_generated && master_prompt) {
        showHandoffResultModal(master_prompt, 'Session Completed - Handoff Generated')
      }
      
      // Clear active session
      state.activeSession = null
      updateActiveSessionIndicator()
      
      // Reload sessions
      await loadSessions()
    }
  } catch (error) {
    console.error('Complete session error:', error)
    showAlert('error', 'Failed to complete session')
  }
}

/**
 * 📊 LOAD SESSION TIMELINE FOR PROJECT
 * Shows all sessions in chronological order
 */
async function loadSessionTimeline(projectId) {
  try {
    const response = await axios.get(`/api/projects/${projectId}/sessions-timeline`)
    
    if (response.data.success) {
      const sessions = response.data.data
      renderSessionTimeline(sessions)
    }
  } catch (error) {
    console.error('Load session timeline error:', error)
  }
}

/**
 * 🎨 RENDER SESSION TIMELINE
 */
function renderSessionTimeline(sessions) {
  const timelineContainer = document.getElementById('sessions-timeline')
  
  if (!sessions || sessions.length === 0) {
    timelineContainer.innerHTML = `
      <div class="text-center text-gray-500 py-8">
        <i class="fas fa-history text-4xl mb-2 opacity-50"></i>
        <p>No sessions yet for this project</p>
      </div>
    `
    return
  }
  
  const timelineHTML = `
    <div class="bg-white rounded-lg border p-4">
      <h4 class="font-bold mb-4 flex items-center gap-2">
        <i class="fas fa-stream text-blue-600"></i>
        Session Timeline (${sessions.length} sessions)
      </h4>
      <div class="relative">
        <!-- Timeline line -->
        <div class="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        <!-- Timeline items -->
        <div class="space-y-4">
          ${sessions.map((session, index) => `
            <div class="relative pl-14">
              <!-- Timeline dot -->
              <div class="absolute left-4 w-4 h-4 rounded-full border-2 
                ${session.status === 'completed' ? 'bg-green-500 border-green-600' : 
                  session.status === 'in_progress' ? 'bg-blue-500 border-blue-600 animate-pulse' : 
                  'bg-gray-300 border-gray-400'}">
              </div>
              
              <!-- Session card -->
              <div class="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition cursor-pointer"
                   onclick="viewSessionDetails(${session.id})">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-gray-900">Session #${session.session_number}</span>
                    <span class="text-xs px-2 py-1 rounded bg-${getStatusColor(session.status)}-100 text-${getStatusColor(session.status)}-700">
                      ${session.status}
                    </span>
                  </div>
                  <div class="text-xs text-gray-500">
                    ${session.credits_used || 0} credits
                  </div>
                </div>
                <div class="text-sm text-gray-600 mb-1">
                  <i class="fas fa-user text-gray-400 mr-1"></i>
                  ${session.account_name}
                </div>
                <div class="flex items-center gap-4 text-xs text-gray-500">
                  <span><i class="fas fa-comments mr-1"></i>${session.conversation_count} turns</span>
                  <span><i class="fas fa-exchange-alt mr-1"></i>${session.handoff_count} handoffs</span>
                  <span><i class="fas fa-clock mr-1"></i>${formatDate(session.started_at)}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `
  
  timelineContainer.innerHTML = timelineHTML
}

/**
 * 👁️ VIEW SESSION DETAILS
 */
async function viewSessionDetails(sessionId) {
  try {
    const response = await axios.get(`/api/sessions/${sessionId}/detail`)
    
    if (response.data.success) {
      const { session, previous_handoff, conversations } = response.data.data
      
      // Show modal with session details
      showSessionDetailsModal(session, previous_handoff, conversations)
    }
  } catch (error) {
    console.error('View session details error:', error)
    showAlert('error', 'Failed to load session details')
  }
}

/**
 * 🎨 UPDATE ACTIVE SESSION INDICATOR
 */
function updateActiveSessionIndicator() {
  const indicator = document.getElementById('active-session-indicator')
  
  if (!state.activeSession) {
    indicator.classList.add('hidden')
    return
  }
  
  indicator.classList.remove('hidden')
  document.getElementById('active-session-number').textContent = state.activeSession.session_number
  document.getElementById('active-project-name').textContent = state.activeSession.project_name || 'Loading...'
}

/**
 * 💬 SHOW HANDOFF MODAL
 */
function showHandoffModal(sessionNumber, handoffContent) {
  const modal = document.createElement('div')
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
  modal.innerHTML = `
    <div class="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
      <div class="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
        <h3 class="text-xl font-bold flex items-center gap-2">
          <i class="fas fa-exchange-alt text-blue-600"></i>
          Session #${sessionNumber} - Previous Handoff
        </h3>
        <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      <div class="p-6">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p class="text-sm text-blue-800">
            📖 <strong>Context Loaded!</strong> This handoff was generated from the previous session.
            Review this briefing to understand where the project left off.
          </p>
        </div>
        <div class="bg-gray-50 rounded-lg p-4 border">
          <pre class="whitespace-pre-wrap text-sm font-mono">${handoffContent}</pre>
        </div>
        <div class="mt-4 flex gap-2">
          <button onclick="navigator.clipboard.writeText(\`${handoffContent.replace(/`/g, '\\`')}\`); showAlert('success', 'Copied to clipboard!')" 
                  class="btn btn-primary flex-1">
            <i class="fas fa-copy mr-2"></i>Copy to Clipboard
          </button>
          <button onclick="this.closest('.fixed').remove()" class="btn btn-secondary flex-1">
            <i class="fas fa-check mr-2"></i>Got It!
          </button>
        </div>
      </div>
    </div>
  `
  document.body.appendChild(modal)
}

/**
 * 📄 SHOW SESSION DETAILS MODAL
 */
function showSessionDetailsModal(session, previousHandoff, conversations) {
  const modal = document.createElement('div')
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
  modal.innerHTML = `
    <div class="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-auto">
      <div class="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
        <h3 class="text-xl font-bold flex items-center gap-2">
          <i class="fas fa-info-circle text-blue-600"></i>
          Session #${session.session_number} - ${session.project_name}
        </h3>
        <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      <div class="p-6 space-y-4">
        <!-- Session Info -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-blue-50 rounded-lg p-3">
            <div class="text-xs text-blue-600 mb-1">Status</div>
            <div class="font-bold text-blue-900">${session.status}</div>
          </div>
          <div class="bg-green-50 rounded-lg p-3">
            <div class="text-xs text-green-600 mb-1">Credits Used</div>
            <div class="font-bold text-green-900">${session.credits_used || 0}</div>
          </div>
          <div class="bg-purple-50 rounded-lg p-3">
            <div class="text-xs text-purple-600 mb-1">Account</div>
            <div class="font-bold text-purple-900">${session.account_name}</div>
          </div>
          <div class="bg-orange-50 rounded-lg p-3">
            <div class="text-xs text-orange-600 mb-1">Started</div>
            <div class="font-bold text-orange-900">${formatDate(session.started_at)}</div>
          </div>
        </div>
        
        <!-- Accomplishments -->
        ${session.accomplishments ? `
          <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 class="font-bold text-green-900 mb-2">✅ Accomplishments</h4>
            <div class="text-sm text-green-800">${session.accomplishments}</div>
          </div>
        ` : ''}
        
        <!-- Blockers -->
        ${session.blockers ? `
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 class="font-bold text-red-900 mb-2">🚧 Blockers</h4>
            <div class="text-sm text-red-800">${session.blockers}</div>
          </div>
        ` : ''}
        
        <!-- Previous Handoff -->
        ${previousHandoff ? `
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 class="font-bold text-blue-900 mb-2">🔄 Handoff Context</h4>
            <div class="bg-white rounded p-3 text-sm font-mono whitespace-pre-wrap border max-h-60 overflow-auto">
${previousHandoff.compressed_context}
            </div>
          </div>
        ` : ''}
        
        <!-- Conversation History -->
        ${conversations && conversations.length > 0 ? `
          <div class="border rounded-lg p-4">
            <h4 class="font-bold mb-2">💬 Conversation History (${conversations.length} turns)</h4>
            <div class="space-y-2 max-h-60 overflow-auto">
              ${conversations.slice(0, 10).map(conv => `
                <div class="text-sm ${conv.role === 'user' ? 'bg-blue-50' : 'bg-gray-50'} rounded p-2">
                  <div class="font-bold text-xs mb-1">${conv.role.toUpperCase()}</div>
                  <div class="text-gray-700">${conv.content.substring(0, 200)}${conv.content.length > 200 ? '...' : ''}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `
  document.body.appendChild(modal)
}

/**
 * 📋 SHOW HANDOFF RESULT MODAL
 */
function showHandoffResultModal(masterPrompt, title = 'AI-Generated Handoff') {
  const modal = document.createElement('div')
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
  modal.innerHTML = `
    <div class="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
      <div class="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
        <h3 class="text-xl font-bold flex items-center gap-2">
          <i class="fas fa-magic text-purple-600"></i>
          ${title}
        </h3>
        <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      <div class="p-6">
        <div class="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-4">
          <p class="text-sm text-purple-800">
            ✨ <strong>Handoff Generated!</strong> AI has analyzed the session and created a comprehensive briefing.
            Copy this and use it for your next session to maintain perfect continuity.
          </p>
        </div>
        <div class="bg-gray-50 rounded-lg p-4 border max-h-96 overflow-auto">
          <pre id="handoff-result-content" class="whitespace-pre-wrap text-sm font-mono">${masterPrompt}</pre>
        </div>
        <div class="mt-4 flex gap-2">
          <button onclick="navigator.clipboard.writeText(document.getElementById('handoff-result-content').textContent); showAlert('success', 'Copied to clipboard!')" 
                  class="btn btn-primary flex-1">
            <i class="fas fa-copy mr-2"></i>Copy to Clipboard
          </button>
          <button onclick="downloadText(document.getElementById('handoff-result-content').textContent, 'handoff.txt')" 
                  class="btn btn-secondary flex-1">
            <i class="fas fa-download mr-2"></i>Download
          </button>
        </div>
      </div>
    </div>
  `
  document.body.appendChild(modal)
}

/**
 * 💾 DOWNLOAD TEXT FILE
 */
function downloadText(content, filename) {
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
  showAlert('success', 'Downloaded!')
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
