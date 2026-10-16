const state = {
  data: null,
  view: 'projects',
  projectId: null,
  modal: null,
};

const STAGE_ORDER = ['idea', 'draft', 'ready', 'published'];
const STAGE_LABEL = { idea: 'Idea', draft: 'Draft', ready: 'Ready', published: 'Published' };
const NETWORK_LABEL = { instagram: 'Instagram', tiktok: 'TikTok', pinterest: 'Pinterest', x: 'X', youtube: 'YouTube' };

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s == null ? '' : s;
  return d.innerHTML;
}

function stageOf(post) {
  let min = STAGE_ORDER.length - 1;
  for (const ch of Object.values(post.channels)) {
    const rank = STAGE_ORDER.indexOf(ch.status);
    if (rank !== -1 && rank < min) min = rank;
  }
  return STAGE_ORDER[min];
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function postDate(post) {
  return (post.datetime || '').slice(0, 10);
}

function postTime(post) {
  return (post.datetime || '').slice(11, 16);
}

function networkIcon(network, cls) {
  return `<span class="net-icon ${cls || ''} net-${esc(network)}" title="${esc(NETWORK_LABEL[network] || network)}">${NETWORK_ICONS[network] || esc(network)}</span>`;
}

function getProject(id) {
  return state.data.projects.find((p) => p.id === id);
}

function setTab(name) {
  document.getElementById('tab-projects').classList.toggle('tab-active', name === 'projects');
  document.getElementById('tab-calendar').classList.toggle('tab-active', name === 'calendar');
}

let hintTimer = null;
function hint(msg) {
  let el = document.querySelector('.hint-toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'hint-toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('hint-visible');
  clearTimeout(hintTimer);
  hintTimer = setTimeout(() => el.classList.remove('hint-visible'), 2200);
}

const DEMO_ONLY = "Not part of this demo: the proof of concept uses preset data.";

function getPost(project, postId) {
  return (project.posts || []).find((p) => p.id === postId);
}

function channelKeys(project, post) {
  return project.accounts
    .map((a) => a.network)
    .filter((n) => post.channels && post.channels[n]);
}

function modalDate(post) {
  const d = new Date(post.datetime);
  const date = d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
  return `${date} · ${postTime(post)}`;
}

function renderProjects() {
  state.view = 'projects';
  setTab('projects');
  document.getElementById('back-btn').hidden = true;
  const tiles = state.data.projects.map((p) => `
    <button class="project-tile" data-project="${esc(p.id)}">
      <span class="project-logo">${esc(p.name.trim().charAt(0).toUpperCase())}</span>
      <span class="project-name">${esc(p.name)}</span>
      <span class="project-sub">${p.accounts.length} account${p.accounts.length === 1 ? '' : 's'}</span>
    </button>
  `).join('');
  document.getElementById('app').innerHTML = `
    <h2 class="view-title">Projects</h2>
    <div class="project-grid">
      ${tiles}
      <button class="project-tile ghost-tile" id="ghost-project">
        <span class="ghost-plus">+</span>
        <span class="project-sub">New project</span>
      </button>
    </div>
  `;
  document.querySelectorAll('.project-tile[data-project]').forEach((el) => {
    el.addEventListener('click', () => renderProject(el.dataset.project));
  });
  document.getElementById('ghost-project').addEventListener('click', () => hint(DEMO_ONLY));
}

function renderCalendar() {
  state.view = 'calendar';
  setTab('calendar');
  document.getElementById('back-btn').hidden = true;
  const today = todayStr();
  const rows = [];
  for (const p of state.data.projects) {
    for (const post of p.posts || []) {
      if (postDate(post) === today) rows.push({ project: p, post });
    }
  }
  rows.sort((a, b) => (a.post.datetime || '').localeCompare(b.post.datetime || ''));
  const cards = rows.map(({ project, post }) => {
    const stage = stageOf(post);
    const tags = Object.keys(post.channels).map((n) => networkIcon(n)).join('');
    return `
      <button class="post-card" data-project="${esc(project.id)}" data-post="${esc(post.id)}">
        <span class="post-time">${esc(postTime(post))}</span>
        <span class="post-title">${esc(post.title)}<span class="post-project">${esc(project.name)}</span></span>
        <span class="stage-badge stage-${stage}">${STAGE_LABEL[stage]}</span>
        <span class="post-channels">${tags}</span>
      </button>
    `;
  }).join('');
  document.getElementById('app').innerHTML = `
    <h2 class="view-title">Today, all projects</h2>
    <div class="post-list">
      ${cards || '<p class="empty-state">Nothing scheduled for today.</p>'}
    </div>
  `;
  document.querySelectorAll('.post-card').forEach((el) => {
    el.addEventListener('click', () => {
      renderProject(el.dataset.project);
      openPost(el.dataset.post);
    });
  });
}

function renderProject(projectId) {
  state.view = 'project';
  setTab('projects');
  state.projectId = projectId;
  const p = getProject(projectId);
  document.getElementById('back-btn').hidden = false;

  const accounts = p.accounts.map((a) => `
    <div class="account ${a.status === 'to_create' ? 'account-tocreate' : ''}">
      ${networkIcon(a.network)}
      <span class="account-handle">${a.handle ? esc(a.handle) : 'not created yet'}</span>
      ${a.status === 'to_create' ? '<span class="account-chip">to create</span>' : ''}
    </div>
  `).join('');

  const todays = (p.posts || []).filter((post) => postDate(post) === todayStr());
  const cards = todays.map((post) => {
    const stage = stageOf(post);
    const tags = Object.keys(post.channels).map((n) => networkIcon(n)).join('');
    return `
      <button class="post-card" data-post="${esc(post.id)}">
        <span class="post-time">${esc(postTime(post))}</span>
        <span class="post-title">${esc(post.title)}</span>
        <span class="stage-badge stage-${stage}">${STAGE_LABEL[stage]}</span>
        <span class="post-channels">${tags}</span>
      </button>
    `;
  }).join('');

  document.getElementById('app').innerHTML = `
    <div class="project-header">
      <span class="project-logo large">${esc(p.name.trim().charAt(0).toUpperCase())}</span>
      <div>
        <h2 class="project-title">${esc(p.name)}</h2>
        ${p.website ? `<button class="site-link">${esc(p.website)}</button>` : ''}
      </div>
    </div>
    <div class="accounts-strip">
      ${accounts}
      <button class="account account-ghost" id="ghost-account">+ Add social network</button>
    </div>
    <div class="section-head">
      <h3 class="section-title">Today</h3>
      <button class="ghost-btn" id="ghost-post">+ New post</button>
    </div>
    <div class="post-list">
      ${cards || '<p class="empty-state">Nothing scheduled for today.</p>'}
    </div>
  `;
  document.querySelectorAll('.post-card').forEach((el) => {
    el.addEventListener('click', () => openPost(el.dataset.post));
  });
  const siteLink = document.querySelector('.site-link');
  if (siteLink) {
    siteLink.addEventListener('click', () => window.api.openExternal(p.website));
  }
  document.getElementById('ghost-account').addEventListener('click', () => hint(DEMO_ONLY));
  document.getElementById('ghost-post').addEventListener('click', () => hint(DEMO_ONLY));
}

function openPost(postId) {
  const p = getProject(state.projectId);
  const post = getPost(p, postId);
  if (!post) return;
  const keys = channelKeys(p, post);
  state.modal = { postId, channel: keys[0] || null };
  renderModal();
}

function closeModal() {
  state.modal = null;
  document.getElementById('modal-root').innerHTML = '';
}

function renderModal() {
  const p = getProject(state.projectId);
  const post = getPost(p, state.modal.postId);
  const keys = channelKeys(p, post);
  const active = state.modal.channel;
  const ch = active ? post.channels[active] : null;
  const text = ch ? (ch.text != null ? ch.text : post.masterText) : '';

  const tabs = keys.map((n) => {
    const status = post.channels[n].status;
    return `
      <button class="ch-tab ${n === active ? 'ch-tab-active' : ''}" data-channel="${esc(n)}" title="${esc(NETWORK_LABEL[n] || n)}">
        ${networkIcon(n, 'ch-tab-icon status-' + status)}
        <span class="ch-dot status-${status}"></span>
      </button>
    `;
  }).join('');

  document.getElementById('modal-root').innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal-head">
          <div>
            <h3 class="modal-title">${esc(post.title)}</h3>
            <span class="modal-when">${esc(modalDate(post))}</span>
          </div>
          <button class="modal-close" aria-label="Close">&times;</button>
        </div>
        <div class="modal-section">
          <span class="field-label">Master text</span>
          <p class="master-text">${esc(post.masterText)}</p>
          <span class="field-label">Media</span>
          ${post.mediaPath
            ? `<button class="media-link" title="Open folder">${esc(post.mediaPath)}</button><p class="media-error" hidden></p>`
            : '<p class="media-path">No media folder set</p>'}
        </div>
        <div class="modal-section">
          <span class="field-label">Channels</span>
          <div class="ch-tabs">${tabs}</div>
          ${ch ? `
            <div class="ch-panel">
              <div class="ch-panel-head">
                <span class="ch-name">${esc(NETWORK_LABEL[active] || active)}</span>
                <div class="status-seg">
                  ${STAGE_ORDER.map((s) => `
                    <button class="status-opt status-${s} ${s === ch.status ? 'status-opt-active' : ''}" data-status="${s}">${STAGE_LABEL[s]}</button>
                  `).join('')}
                </div>
              </div>
              <textarea class="ch-edit" rows="4" spellcheck="false">${esc(text)}</textarea>
              <div class="ch-actions">
                ${ch.text == null ? '<span class="ch-note">Same as master text, edit to adapt it for this channel.</span>' : ''}
                <button class="copy-btn">Copy</button>
              </div>
            </div>
          ` : '<p class="empty-state">No channels on this post.</p>'}
        </div>
      </div>
    </div>
  `;

  const root = document.getElementById('modal-root');
  root.querySelector('.modal-close').addEventListener('click', closeModal);
  root.querySelector('.modal-overlay').addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) closeModal();
  });
  root.querySelectorAll('.ch-tab').forEach((el) => {
    el.addEventListener('click', () => {
      state.modal.channel = el.dataset.channel;
      renderModal();
    });
  });

  const editBox = root.querySelector('.ch-edit');
  if (editBox) {
    editBox.addEventListener('input', () => {
      ch.text = editBox.value;
      save();
    });
  }

  root.querySelectorAll('.status-opt').forEach((el) => {
    el.addEventListener('click', () => {
      ch.status = el.dataset.status;
      save();
      renderModal();
    });
  });

  const copyBtn = root.querySelector('.copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await window.api.copyText(editBox ? editBox.value : text);
        copyBtn.textContent = 'Copied';
      } catch (err) {
        copyBtn.textContent = "Couldn't copy";
      }
      setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1200);
    });
  }

  const mediaLink = root.querySelector('.media-link');
  if (mediaLink) {
    mediaLink.addEventListener('click', async () => {
      const err = await window.api.openMediaFolder(post.mediaPath);
      if (err) {
        const errEl = root.querySelector('.media-error');
        errEl.textContent = `Folder not found: ${post.mediaPath}`;
        errEl.hidden = false;
      }
    });
  }
}

let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    window.api.saveData(state.data);
    if (state.view === 'project') renderProject(state.projectId);
  }, 250);
}

async function init() {
  state.data = await window.api.loadData();
  renderProjects();
  document.getElementById('back-btn').addEventListener('click', renderProjects);
  document.getElementById('tab-projects').addEventListener('click', renderProjects);
  document.getElementById('tab-calendar').addEventListener('click', renderCalendar);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.modal) closeModal();
  });
}

init();
