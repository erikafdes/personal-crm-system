/**
 * PERSONAL CRM SYSTEM
 * CODTECH Internship Project - Task 1
 * Full JavaScript Application
 */

// ============================================================
//  DATA LAYER — localStorage persistence
// ============================================================

const DB = {
  // Get all contacts
  getContacts: () => JSON.parse(localStorage.getItem('crm_contacts') || '[]'),
  // Save all contacts
  saveContacts: (data) => localStorage.setItem('crm_contacts', JSON.stringify(data)),
  // Get all interactions
  getInteractions: () => JSON.parse(localStorage.getItem('crm_interactions') || '[]'),
  saveInteractions: (data) => localStorage.setItem('crm_interactions', JSON.stringify(data)),
  // Get all reminders
  getReminders: () => JSON.parse(localStorage.getItem('crm_reminders') || '[]'),
  saveReminders: (data) => localStorage.setItem('crm_reminders', JSON.stringify(data)),
};

// ============================================================
//  UTILITY FUNCTIONS
// ============================================================

// Generate a unique ID
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// Get initials from name
function initials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// Format date to readable string
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Days from today
function daysFrom(dateStr) {
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(dateStr + 'T00:00:00');
  return Math.round((d - today) / 86400000);
}

// Type icon map
const TYPE_ICONS = { Call: '📞', Email: '📧', Meeting: '🤝', Message: '💬', Other: '📌' };

// Interaction count per contact
function interactionCount(contactId) {
  return DB.getInteractions().filter(i => i.contactId === contactId).length;
}

// Last interaction date
function lastInteraction(contactId) {
  const list = DB.getInteractions()
    .filter(i => i.contactId === contactId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  return list[0] ? list[0].date : null;
}

// Show toast notification
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast show ${type}`;
  setTimeout(() => { t.className = 'toast'; }, 3000);
}

// ============================================================
//  NAVIGATION
// ============================================================

function showSection(name) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  // Show target
  document.getElementById(`section-${name}`).classList.add('active');
  document.getElementById(`nav-${name}`).classList.add('active');
  // Update title
  const titles = { dashboard: 'Dashboard', contacts: 'Contacts', interactions: 'Interactions', reminders: 'Reminders', analytics: 'Analytics' };
  document.getElementById('page-title').textContent = titles[name];
  // Render section
  if (name === 'dashboard') renderDashboard();
  if (name === 'contacts') renderContacts();
  if (name === 'interactions') { populateContactDropdowns(); renderInteractions(); }
  if (name === 'reminders') { populateContactDropdowns(); renderReminders(); }
  if (name === 'analytics') renderAnalytics();
  // Close sidebar on mobile
  if (window.innerWidth < 900) document.getElementById('sidebar').classList.remove('open');
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ============================================================
//  MODAL MANAGEMENT
// ============================================================

function openModal(id) {
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// Close modal when clicking overlay
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', function(e) {
    if (e.target === this) closeModal(this.id);
  });
});

// ============================================================
//  CONTACTS
// ============================================================

// Open contact modal for adding
function openAddContact() {
  resetContactForm();
  document.getElementById('contactModalTitle').textContent = 'Add Contact';
  document.getElementById('contactId').value = '';
  openModal('contactModal');
}

function resetContactForm() {
  ['contactFirstName','contactLastName','contactEmail','contactPhone',
   'contactCompany','contactTitle','contactSocial','contactTags','contactNotes',
   'contactBirthday'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('contactCategory').value = 'Work';
  document.getElementById('contactStatus').value = 'Active';
}

// Save or update contact
function saveContact() {
  const firstName = document.getElementById('contactFirstName').value.trim();
  const lastName  = document.getElementById('contactLastName').value.trim();
  if (!firstName || !lastName) {
    showToast('First and last name are required!', 'error');
    return;
  }

  const contacts = DB.getContacts();
  const existingId = document.getElementById('contactId').value;

  const contact = {
    id: existingId || uid(),
    firstName,
    lastName,
    name: `${firstName} ${lastName}`,
    email:    document.getElementById('contactEmail').value.trim(),
    phone:    document.getElementById('contactPhone').value.trim(),
    company:  document.getElementById('contactCompany').value.trim(),
    jobTitle: document.getElementById('contactTitle').value.trim(),
    category: document.getElementById('contactCategory').value,
    status:   document.getElementById('contactStatus').value,
    birthday: document.getElementById('contactBirthday').value,
    social:   document.getElementById('contactSocial').value.trim(),
    tags:     document.getElementById('contactTags').value.split(',').map(t => t.trim()).filter(Boolean),
    notes:    document.getElementById('contactNotes').value.trim(),
    createdAt: existingId ? (contacts.find(c => c.id === existingId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (existingId) {
    const idx = contacts.findIndex(c => c.id === existingId);
    contacts[idx] = contact;
    showToast('Contact updated successfully!');
  } else {
    contacts.push(contact);
    showToast('Contact added!');
  }

  DB.saveContacts(contacts);
  closeModal('contactModal');
  renderContacts();
  populateContactDropdowns();
  renderDashboard();
  updateStats();
}

// Delete contact
function deleteContact(id) {
  if (!confirm('Delete this contact and all related data?')) return;
  const contacts = DB.getContacts().filter(c => c.id !== id);
  DB.saveContacts(contacts);
  // Remove related interactions and reminders
  DB.saveInteractions(DB.getInteractions().filter(i => i.contactId !== id));
  DB.saveReminders(DB.getReminders().filter(r => r.contactId !== id));
  showToast('Contact deleted.');
  renderContacts();
  renderDashboard();
  updateStats();
  closeModal('contactDetailModal');
}

// Edit contact — populate form
function editContact(id) {
  const c = DB.getContacts().find(c => c.id === id);
  if (!c) return;
  resetContactForm();
  document.getElementById('contactId').value = c.id;
  document.getElementById('contactFirstName').value = c.firstName || '';
  document.getElementById('contactLastName').value = c.lastName || '';
  document.getElementById('contactEmail').value = c.email || '';
  document.getElementById('contactPhone').value = c.phone || '';
  document.getElementById('contactCompany').value = c.company || '';
  document.getElementById('contactTitle').value = c.jobTitle || '';
  document.getElementById('contactCategory').value = c.category || 'Work';
  document.getElementById('contactStatus').value = c.status || 'Active';
  document.getElementById('contactBirthday').value = c.birthday || '';
  document.getElementById('contactSocial').value = c.social || '';
  document.getElementById('contactTags').value = (c.tags || []).join(', ');
  document.getElementById('contactNotes').value = c.notes || '';
  document.getElementById('contactModalTitle').textContent = 'Edit Contact';
  closeModal('contactDetailModal');
  openModal('contactModal');
}

// View contact detail
function viewContact(id) {
  const c = DB.getContacts().find(c => c.id === id);
  if (!c) return;
  document.getElementById('detailContactName').textContent = c.name;
  const interactions = DB.getInteractions().filter(i => i.contactId === id).sort((a,b) => new Date(b.date) - new Date(a.date));
  const reminders = DB.getReminders().filter(r => r.contactId === id && r.status !== 'done');
  const lastDate = lastInteraction(id);

  document.getElementById('contact-detail-body').innerHTML = `
    <div class="detail-header">
      <div class="detail-avatar">${initials(c.name)}</div>
      <div class="detail-info">
        <h3>${c.name}</h3>
        <p>${c.jobTitle ? c.jobTitle + (c.company ? ' @ ' + c.company : '') : (c.company || '')}</p>
        <p><span class="category-badge">${c.category}</span> &nbsp;
           <span class="tag" style="font-size:0.72rem">${c.status}</span></p>
        <div class="detail-actions">
          <button class="btn-primary" onclick="editContact('${c.id}')">✏ Edit</button>
          <button class="btn-primary" onclick="openInteractionFor('${c.id}')">+ Log Interaction</button>
          <button class="btn-secondary" onclick="deleteContact('${c.id}')">🗑 Delete</button>
        </div>
      </div>
    </div>

    <div class="detail-grid">
      <div class="detail-field"><label>Email</label><span>${c.email || '—'}</span></div>
      <div class="detail-field"><label>Phone</label><span>${c.phone || '—'}</span></div>
      <div class="detail-field"><label>Company</label><span>${c.company || '—'}</span></div>
      <div class="detail-field"><label>Birthday</label><span>${c.birthday ? formatDate(c.birthday) : '—'}</span></div>
      <div class="detail-field"><label>Social</label><span>${c.social || '—'}</span></div>
      <div class="detail-field"><label>Last Interaction</label><span>${lastDate ? formatDate(lastDate) : '—'}</span></div>
      <div class="detail-field"><label>Total Interactions</label><span>${interactions.length}</span></div>
      <div class="detail-field"><label>Added</label><span>${formatDate(c.createdAt?.slice(0,10))}</span></div>
    </div>

    ${c.tags?.length ? `<div style="margin-bottom:16px"><p class="detail-section-title">Tags</p><div class="contact-card-tags">${c.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div></div>` : ''}
    ${c.notes ? `<div style="margin-bottom:16px"><p class="detail-section-title">Notes</p><p style="font-size:0.88rem;color:var(--text-secondary);line-height:1.6">${c.notes}</p></div>` : ''}

    ${reminders.length ? `
    <div style="margin-bottom:20px">
      <p class="detail-section-title">Pending Reminders (${reminders.length})</p>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${reminders.map(r => `
          <div style="background:var(--bg-hover);border-radius:8px;padding:10px 14px;display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-size:0.88rem;font-weight:600">${r.title}</div>
              <div style="font-size:0.78rem;color:var(--text-secondary)">${formatDate(r.date)}</div>
            </div>
            <span class="priority-badge priority-${r.priority}">${r.priority}</span>
          </div>
        `).join('')}
      </div>
    </div>` : ''}

    <div>
      <p class="detail-section-title">Interaction History (${interactions.length})</p>
      <div style="display:flex;flex-direction:column;gap:10px;max-height:200px;overflow-y:auto">
        ${interactions.length ? interactions.map(i => `
          <div style="background:var(--bg-hover);border-radius:8px;padding:10px 14px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
              <span style="font-size:0.85rem;font-weight:600">${TYPE_ICONS[i.type] || '•'} ${i.type}${i.summary ? ' — ' + i.summary : ''}</span>
              <span style="font-size:0.75rem;color:var(--text-muted)">${formatDate(i.date)}</span>
            </div>
            ${i.notes ? `<div style="font-size:0.82rem;color:var(--text-secondary)">${i.notes}</div>` : ''}
          </div>
        `).join('') : '<p class="empty-state">No interactions yet.</p>'}
      </div>
    </div>
  `;
  openModal('contactDetailModal');
}

// Render contacts
let currentView = 'grid';
function setView(v) {
  currentView = v;
  document.getElementById('gridViewBtn').classList.toggle('active', v === 'grid');
  document.getElementById('listViewBtn').classList.toggle('active', v === 'list');
  renderContacts();
}

function renderContacts(searchTerm = '') {
  const container = document.getElementById('contacts-container');
  let contacts = DB.getContacts();

  // Filter
  const catFilter  = document.getElementById('filterCategory')?.value;
  const statFilter = document.getElementById('filterStatus')?.value;
  const sort       = document.getElementById('sortContacts')?.value;
  const search     = searchTerm || document.getElementById('globalSearch')?.value?.toLowerCase() || '';

  if (catFilter)  contacts = contacts.filter(c => c.category === catFilter);
  if (statFilter) contacts = contacts.filter(c => c.status === statFilter);
  if (search)     contacts = contacts.filter(c =>
    c.name.toLowerCase().includes(search) ||
    c.email?.toLowerCase().includes(search) ||
    c.company?.toLowerCase().includes(search) ||
    (c.tags || []).some(t => t.toLowerCase().includes(search))
  );

  // Sort
  if (sort === 'name') contacts.sort((a,b) => a.name.localeCompare(b.name));
  else if (sort === 'recent') contacts.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  else if (sort === 'interaction') contacts.sort((a,b) => {
    const la = lastInteraction(a.id) || '0';
    const lb = lastInteraction(b.id) || '0';
    return lb.localeCompare(la);
  });

  if (!contacts.length) {
    container.className = 'contacts-grid';
    container.innerHTML = `
      <div class="empty-state-full">
        <div class="empty-icon">◉</div>
        <p>No contacts found.</p>
        <button class="btn-primary" onclick="openModal('contactModal')">+ Add Contact</button>
      </div>`;
    return;
  }

  if (currentView === 'grid') {
    container.className = 'contacts-grid';
    container.innerHTML = contacts.map(c => `
      <div class="contact-card" onclick="viewContact('${c.id}')">
        <div class="contact-card-avatar">${initials(c.name)}</div>
        <div class="contact-card-name">${c.name}</div>
        <div class="contact-card-title">${c.jobTitle ? c.jobTitle : ''}${c.jobTitle && c.company ? ' · ' : ''}${c.company || ''}</div>
        ${c.tags?.length ? `<div class="contact-card-tags">${c.tags.slice(0,3).map(t=>`<span class="tag">${t}</span>`).join('')}</div>` : ''}
        <div class="contact-card-footer">
          <span class="category-badge">${c.category}</span>
          <div class="contact-card-actions" onclick="event.stopPropagation()">
            <button class="btn-icon" title="Edit" onclick="editContact('${c.id}')">✏</button>
            <button class="btn-icon" title="Log Interaction" onclick="openInteractionFor('${c.id}')">+</button>
            <button class="btn-icon" title="Delete" onclick="deleteContact('${c.id}')">🗑</button>
          </div>
        </div>
      </div>
    `).join('');
  } else {
    container.className = 'contacts-list-view';
    container.innerHTML = contacts.map(c => `
      <div class="contact-row" onclick="viewContact('${c.id}')">
        <div class="list-avatar">${initials(c.name)}</div>
        <div class="list-info">
          <div>
            <div class="list-name">${c.name}</div>
            <div class="list-sub">${c.email || '—'}</div>
          </div>
          <div>
            <div style="font-size:0.82rem;color:var(--text-secondary)">${c.company || '—'}</div>
            <div class="list-sub">${c.phone || ''}</div>
          </div>
          <span class="category-badge">${c.category}</span>
          <div style="font-size:0.78rem;color:var(--text-muted)">${interactionCount(c.id)} interactions</div>
        </div>
        <div class="contact-row-actions" onclick="event.stopPropagation()">
          <button class="btn-icon" onclick="editContact('${c.id}')">✏</button>
          <button class="btn-icon" onclick="openInteractionFor('${c.id}')">+</button>
          <button class="btn-icon" onclick="deleteContact('${c.id}')">🗑</button>
        </div>
      </div>
    `).join('');
  }
}

// ============================================================
//  INTERACTIONS
// ============================================================

let activeSentiment = 'neutral';

function setSentiment(val) {
  activeSentiment = val;
  document.getElementById('interactionSentiment').value = val;
  ['positive','neutral','negative'].forEach(s => {
    document.getElementById(`sent-${s}`).classList.toggle('active', s === val);
  });
}

function openInteractionFor(contactId) {
  document.getElementById('interactionId').value = '';
  document.getElementById('interactionDate').value = new Date().toISOString().slice(0,10);
  document.getElementById('interactionContact').value = contactId;
  document.getElementById('interactionType').value = 'Call';
  document.getElementById('interactionSummary').value = '';
  document.getElementById('interactionNotes').value = '';
  document.getElementById('interactionFollowup').checked = false;
  setSentiment('neutral');
  closeModal('contactDetailModal');
  openModal('interactionModal');
}

function saveInteraction() {
  const contactId = document.getElementById('interactionContact').value;
  const date = document.getElementById('interactionDate').value;
  const type = document.getElementById('interactionType').value;
  if (!contactId || !date) {
    showToast('Contact and date are required!', 'error');
    return;
  }

  const interactions = DB.getInteractions();
  const existingId = document.getElementById('interactionId').value;

  const interaction = {
    id: existingId || uid(),
    contactId,
    type,
    date,
    summary:   document.getElementById('interactionSummary').value.trim(),
    notes:     document.getElementById('interactionNotes').value.trim(),
    sentiment: document.getElementById('interactionSentiment').value,
    followup:  document.getElementById('interactionFollowup').checked,
    createdAt: existingId ? (interactions.find(i => i.id === existingId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
  };

  if (existingId) {
    const idx = interactions.findIndex(i => i.id === existingId);
    interactions[idx] = interaction;
    showToast('Interaction updated!');
  } else {
    interactions.push(interaction);
    showToast('Interaction logged!');
  }

  DB.saveInteractions(interactions);
  closeModal('interactionModal');
  renderInteractions();
  renderDashboard();
  updateStats();
}

function deleteInteraction(id) {
  if (!confirm('Delete this interaction?')) return;
  DB.saveInteractions(DB.getInteractions().filter(i => i.id !== id));
  showToast('Interaction deleted.');
  renderInteractions();
  renderDashboard();
  updateStats();
}

function renderInteractions() {
  const container = document.getElementById('interactions-container');
  const contacts = DB.getContacts();
  let interactions = DB.getInteractions();

  const filterContact = document.getElementById('filterInteractionContact')?.value;
  const filterType = document.getElementById('filterInteractionType')?.value;

  if (filterContact) interactions = interactions.filter(i => i.contactId === filterContact);
  if (filterType)    interactions = interactions.filter(i => i.type === filterType);

  interactions.sort((a,b) => new Date(b.date) - new Date(a.date));

  if (!interactions.length) {
    container.innerHTML = `
      <div class="empty-state-full">
        <div class="empty-icon">◎</div>
        <p>No interactions found.</p>
      </div>`;
    container.className = 'timeline';
    return;
  }

  container.className = 'timeline';
  container.innerHTML = interactions.map(i => {
    const contact = contacts.find(c => c.id === i.contactId);
    return `
      <div class="timeline-item">
        <div class="timeline-icon">${TYPE_ICONS[i.type] || '📌'}</div>
        <div class="timeline-body">
          <div class="timeline-header">
            <div class="timeline-title">
              ${i.type}${i.summary ? ' — ' + i.summary : ''}
              <span class="sentiment-dot sentiment-${i.sentiment}" title="${i.sentiment}"></span>
            </div>
            <div style="display:flex;align-items:center;gap:10px">
              <span class="timeline-date">${formatDate(i.date)}</span>
              <button class="btn-icon" onclick="deleteInteraction('${i.id}')">🗑</button>
            </div>
          </div>
          ${contact ? `<div class="timeline-contact" onclick="viewContact('${contact.id}')" style="cursor:pointer">◉ ${contact.name}</div>` : ''}
          ${i.notes ? `<div class="timeline-notes">${i.notes}</div>` : ''}
          ${i.followup ? `<div style="margin-top:6px"><span class="tag" style="color:var(--yellow);border-color:var(--yellow)">⏰ Follow-up needed</span></div>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// ============================================================
//  REMINDERS
// ============================================================

function saveReminder() {
  const contactId = document.getElementById('reminderContact').value;
  const title     = document.getElementById('reminderTitle').value.trim();
  const date      = document.getElementById('reminderDate').value;
  if (!contactId || !title || !date) {
    showToast('Contact, title, and date are required!', 'error');
    return;
  }

  const reminders = DB.getReminders();
  const existingId = document.getElementById('reminderId').value;

  const reminder = {
    id: existingId || uid(),
    contactId,
    title,
    date,
    priority: document.getElementById('reminderPriority').value,
    notes:    document.getElementById('reminderNotes').value.trim(),
    status:   'upcoming',
    createdAt: existingId ? (reminders.find(r => r.id === existingId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
  };

  if (existingId) {
    const idx = reminders.findIndex(r => r.id === existingId);
    reminders[idx] = reminder;
    showToast('Reminder updated!');
  } else {
    reminders.push(reminder);
    showToast('Reminder added!');
  }

  DB.saveReminders(reminders);
  closeModal('reminderModal');
  renderReminders();
  renderDashboard();
  updateStats();
}

function completeReminder(id) {
  const reminders = DB.getReminders();
  const idx = reminders.findIndex(r => r.id === id);
  if (idx !== -1) { reminders[idx].status = 'done'; }
  DB.saveReminders(reminders);
  showToast('Reminder completed!');
  renderReminders();
  updateStats();
}

function deleteReminder(id) {
  if (!confirm('Delete this reminder?')) return;
  DB.saveReminders(DB.getReminders().filter(r => r.id !== id));
  showToast('Reminder deleted.');
  renderReminders();
  updateStats();
}

function renderReminders() {
  const container = document.getElementById('reminders-container');
  const contacts = DB.getContacts();
  let reminders = DB.getReminders();
  const filterStatus = document.getElementById('filterReminderStatus')?.value;
  const today = new Date(); today.setHours(0,0,0,0);

  // Assign computed status
  reminders = reminders.map(r => ({
    ...r,
    computedStatus: r.status === 'done' ? 'done' : (new Date(r.date + 'T00:00:00') < today ? 'overdue' : 'upcoming')
  }));

  if (filterStatus) reminders = reminders.filter(r => r.computedStatus === filterStatus);
  reminders.sort((a,b) => new Date(a.date) - new Date(b.date));

  if (!reminders.length) {
    container.innerHTML = `
      <div class="empty-state-full">
        <div class="empty-icon">◷</div>
        <p>No reminders found.</p>
      </div>`;
    return;
  }

  container.innerHTML = reminders.map(r => {
    const contact = contacts.find(c => c.id === r.contactId);
    const d = daysFrom(r.date);
    const dLabel = r.computedStatus === 'done' ? 'Completed' :
                   (d === 0 ? 'Today' : d > 0 ? `In ${d} day${d>1?'s':''}` : `${Math.abs(d)} day${Math.abs(d)>1?'s':''} overdue`);
    return `
      <div class="reminder-item ${r.computedStatus}">
        <div style="flex:1">
          <div class="reminder-title">${r.title}</div>
          <div class="reminder-sub">
            ${contact ? `◉ ${contact.name} · ` : ''}
            📅 ${formatDate(r.date)} · <span style="color:${r.computedStatus === 'overdue' ? 'var(--red)' : r.computedStatus === 'done' ? 'var(--green)' : 'var(--accent-light)'}">${dLabel}</span>
          </div>
          ${r.notes ? `<div style="font-size:0.8rem;color:var(--text-muted);margin-top:4px">${r.notes}</div>` : ''}
        </div>
        <span class="priority-badge priority-${r.priority}">${r.priority}</span>
        <div class="reminder-actions">
          ${r.computedStatus !== 'done' ? `<button class="btn-icon" title="Mark complete" onclick="completeReminder('${r.id}')">✓</button>` : ''}
          <button class="btn-icon" title="Delete" onclick="deleteReminder('${r.id}')">🗑</button>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================================
//  POPULATE DROPDOWNS
// ============================================================

function populateContactDropdowns() {
  const contacts = DB.getContacts().sort((a,b) => a.name.localeCompare(b.name));
  const option = (c) => `<option value="${c.id}">${c.name}</option>`;

  ['interactionContact', 'reminderContact', 'filterInteractionContact'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const selected = el.value;
    const isFilter = id.startsWith('filter');
    el.innerHTML = (isFilter ? '<option value="">All Contacts</option>' : '<option value="">Select contact…</option>')
      + contacts.map(option).join('');
    if (selected) el.value = selected;
  });
}

// ============================================================
//  DASHBOARD
// ============================================================

function renderDashboard() {
  updateStats();

  // Recent contacts
  const contacts = DB.getContacts().sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const rcList = document.getElementById('recent-contacts-list');
  rcList.innerHTML = contacts.length
    ? contacts.map(c => `
      <div class="list-item" onclick="viewContact('${c.id}')">
        <div class="list-avatar">${initials(c.name)}</div>
        <div class="list-info">
          <div class="list-name">${c.name}</div>
          <div class="list-sub">${c.company || c.email || c.category}</div>
        </div>
        <div class="list-meta">${c.category}</div>
      </div>`).join('')
    : '<p class="empty-state">No contacts yet.</p>';

  // Upcoming reminders
  const today = new Date(); today.setHours(0,0,0,0);
  const reminders = DB.getReminders()
    .filter(r => r.status !== 'done' && new Date(r.date + 'T00:00:00') >= today)
    .sort((a,b) => new Date(a.date) - new Date(b.date)).slice(0, 5);
  const contactsMap = Object.fromEntries(DB.getContacts().map(c => [c.id, c]));
  const urlList = document.getElementById('upcoming-reminders-list');
  urlList.innerHTML = reminders.length
    ? reminders.map(r => {
        const c = contactsMap[r.contactId];
        const d = daysFrom(r.date);
        return `
          <div class="list-item" onclick="showSection('reminders')">
            <div class="list-avatar" style="background:var(--accent-glow);color:var(--yellow)">◷</div>
            <div class="list-info">
              <div class="list-name">${r.title}</div>
              <div class="list-sub">${c ? c.name + ' · ' : ''}${formatDate(r.date)}</div>
            </div>
            <div class="list-meta">${d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : `${d}d`}</div>
          </div>`;
      }).join('')
    : '<p class="empty-state">No upcoming reminders.</p>';

  // Recent interactions
  const interactions = DB.getInteractions().sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 6);
  const riList = document.getElementById('recent-interactions-list');
  riList.innerHTML = interactions.length
    ? interactions.map(i => {
        const c = contactsMap[i.contactId];
        return `
          <div class="list-item">
            <div class="list-avatar">${TYPE_ICONS[i.type] || '•'}</div>
            <div class="list-info">
              <div class="list-name">${i.type}${i.summary ? ' — ' + i.summary : ''}</div>
              <div class="list-sub">${c ? c.name : 'Unknown'}</div>
            </div>
            <div class="list-meta">${formatDate(i.date)}</div>
          </div>`;
      }).join('')
    : '<p class="empty-state">No interactions logged yet.</p>';
}

function updateStats() {
  const contacts = DB.getContacts();
  const interactions = DB.getInteractions();
  const reminders = DB.getReminders();
  const today = new Date(); today.setHours(0,0,0,0);

  const upcoming = reminders.filter(r => r.status !== 'done' && new Date(r.date + 'T00:00:00') >= today).length;
  const overdue  = reminders.filter(r => r.status !== 'done' && new Date(r.date + 'T00:00:00') < today).length;

  document.getElementById('stat-total').textContent = contacts.length;
  document.getElementById('stat-interactions').textContent = interactions.length;
  document.getElementById('stat-reminders').textContent = upcoming;
  document.getElementById('stat-overdue').textContent = overdue;
}

// ============================================================
//  ANALYTICS
// ============================================================

function renderAnalytics() {
  const contacts = DB.getContacts();
  const interactions = DB.getInteractions();

  // Category chart
  const cats = {};
  contacts.forEach(c => { cats[c.category] = (cats[c.category] || 0) + 1; });
  const maxCat = Math.max(1, ...Object.values(cats));
  document.getElementById('chart-category').innerHTML = `
    <div class="bar-chart">
      ${Object.entries(cats).sort((a,b) => b[1]-a[1]).map(([cat, cnt]) => `
        <div class="bar-row">
          <div class="bar-label">${cat}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${(cnt/maxCat*100).toFixed(0)}%"></div></div>
          <div class="bar-count">${cnt}</div>
        </div>`).join('') || '<p class="empty-state">No data</p>'}
    </div>`;

  // Interaction type chart
  const types = {};
  interactions.forEach(i => { types[i.type] = (types[i.type] || 0) + 1; });
  const maxType = Math.max(1, ...Object.values(types));
  document.getElementById('chart-interaction-type').innerHTML = `
    <div class="bar-chart">
      ${Object.entries(types).sort((a,b) => b[1]-a[1]).map(([type, cnt]) => `
        <div class="bar-row">
          <div class="bar-label">${TYPE_ICONS[type]} ${type}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${(cnt/maxType*100).toFixed(0)}%"></div></div>
          <div class="bar-count">${cnt}</div>
        </div>`).join('') || '<p class="empty-state">No interactions yet</p>'}
    </div>`;

  // Activity chart - last 30 days
  const days = 30;
  const dayCounts = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    dayCounts[d.toISOString().slice(0,10)] = 0;
  }
  interactions.forEach(i => { if (dayCounts.hasOwnProperty(i.date)) dayCounts[i.date]++; });
  const dayVals = Object.entries(dayCounts).sort(([a],[b]) => a.localeCompare(b)).map(([,v]) => v);
  const maxDay = Math.max(1, ...dayVals);
  document.getElementById('chart-activity').innerHTML = `
    <div class="activity-chart" title="Activity last 30 days">
      ${dayVals.map(v => `<div class="activity-bar" style="height:${Math.max(4, (v/maxDay*100)).toFixed(0)}%" title="${v} interactions"></div>`).join('')}
    </div>
    <p style="font-size:0.75rem;color:var(--text-muted);text-align:right;margin-top:4px">Last 30 days · ${interactions.length} total</p>`;

  // Top contacts
  const topContacts = contacts
    .map(c => ({ ...c, count: interactionCount(c.id) }))
    .sort((a,b) => b.count - a.count).slice(0, 5);
  document.getElementById('top-contacts-list').innerHTML = topContacts.length
    ? topContacts.map(c => `
      <div class="list-item" onclick="viewContact('${c.id}')">
        <div class="list-avatar">${initials(c.name)}</div>
        <div class="list-info"><div class="list-name">${c.name}</div><div class="list-sub">${c.count} interaction${c.count!==1?'s':''}</div></div>
      </div>`).join('')
    : '<p class="empty-state">No data yet.</p>';

  // Neglected contacts (no interaction in 30+ days)
  const thirtyAgo = new Date(); thirtyAgo.setDate(thirtyAgo.getDate() - 30);
  const neglected = contacts.filter(c => {
    const last = lastInteraction(c.id);
    return !last || new Date(last) < thirtyAgo;
  }).slice(0, 5);
  document.getElementById('neglected-contacts-list').innerHTML = neglected.length
    ? neglected.map(c => {
        const last = lastInteraction(c.id);
        return `
          <div class="list-item" onclick="viewContact('${c.id}')">
            <div class="list-avatar">${initials(c.name)}</div>
            <div class="list-info">
              <div class="list-name">${c.name}</div>
              <div class="list-sub">${last ? 'Last: ' + formatDate(last) : 'Never contacted'}</div>
            </div>
          </div>`;
      }).join('')
    : '<p class="empty-state">All contacts are well engaged! 🎉</p>';
}

// ============================================================
//  GLOBAL SEARCH
// ============================================================

function globalSearch() {
  const q = document.getElementById('globalSearch').value.toLowerCase();
  if (!q) { renderContacts(); return; }
  // Switch to contacts and render with search
  showSection('contacts');
  renderContacts(q);
}

// ============================================================
//  EXPORT CSV
// ============================================================

function exportData() {
  const contacts = DB.getContacts();
  if (!contacts.length) { showToast('No contacts to export!', 'error'); return; }

  const headers = ['Name','Email','Phone','Company','Job Title','Category','Status','Birthday','Tags','Notes','Created'];
  const rows = contacts.map(c => [
    c.name, c.email, c.phone, c.company, c.jobTitle, c.category, c.status,
    c.birthday, (c.tags||[]).join(';'), c.notes, c.createdAt?.slice(0,10)
  ].map(v => `"${(v||'').replace(/"/g,'""')}"`));

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'personal_crm_contacts.csv';
  a.click(); URL.revokeObjectURL(url);
  showToast('Contacts exported as CSV!');
}

// ============================================================
//  SAMPLE DATA (for first-time users)
// ============================================================

function seedSampleData() {
  if (DB.getContacts().length > 0) return; // Don't seed if data exists

  const contacts = [
    { id: uid(), firstName: 'Priya', lastName: 'Sharma', name: 'Priya Sharma', email: 'priya@example.com', phone: '+91 98765 43210', company: 'TechCorp India', jobTitle: 'Senior Developer', category: 'Work', status: 'Active', tags: ['mentor', 'tech'], notes: 'Met at Goa Tech Summit 2024. Expert in React.', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: uid(), firstName: 'Arjun', lastName: 'Mehta', name: 'Arjun Mehta', email: 'arjun@startup.in', phone: '+91 87654 32109', company: 'StartupX', jobTitle: 'Founder', category: 'Client', status: 'Active', tags: ['investor', 'startup'], notes: 'Potential investor. Follow up about Series A.', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: uid(), firstName: 'Sneha', lastName: 'Patel', name: 'Sneha Patel', email: 'sneha@gmail.com', phone: '+91 76543 21098', company: '', jobTitle: '', category: 'Personal', status: 'Active', tags: ['friend', 'college'], notes: 'College friend. Lives in Pune.', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];

  const interactions = [
    { id: uid(), contactId: contacts[0].id, type: 'Meeting', date: new Date(Date.now()-2*86400000).toISOString().slice(0,10), summary: 'Code review session', notes: 'Reviewed new dashboard design. She suggested using Tailwind CSS.', sentiment: 'positive', followup: false, createdAt: new Date().toISOString() },
    { id: uid(), contactId: contacts[1].id, type: 'Call', date: new Date(Date.now()-5*86400000).toISOString().slice(0,10), summary: 'Investment discussion', notes: 'Discussed funding requirements. He wants a detailed proposal.', sentiment: 'neutral', followup: true, createdAt: new Date().toISOString() },
    { id: uid(), contactId: contacts[2].id, type: 'Message', date: new Date(Date.now()-10*86400000).toISOString().slice(0,10), summary: 'Birthday wishes', notes: 'Wished her on birthday. She is planning a trip to Goa soon.', sentiment: 'positive', followup: false, createdAt: new Date().toISOString() },
  ];

  const futureDate = new Date(); futureDate.setDate(futureDate.getDate() + 3);
  const reminders = [
    { id: uid(), contactId: contacts[1].id, title: 'Send investment proposal', date: futureDate.toISOString().slice(0,10), priority: 'High', notes: 'Include 3-year financial projection', status: 'upcoming', createdAt: new Date().toISOString() },
  ];

  DB.saveContacts(contacts);
  DB.saveInteractions(interactions);
  DB.saveReminders(reminders);
}

// ============================================================
//  INIT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  seedSampleData();
  populateContactDropdowns();
  renderDashboard();
  // Set today as default for interaction date
  document.getElementById('interactionDate').value = new Date().toISOString().slice(0,10);
});
