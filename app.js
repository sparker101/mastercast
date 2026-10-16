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
    <div class="project-grid">${tiles}</div>
  `;
  document.querySelectorAll('.project-tile').forEach((el) => {
    el.addEventListener('click', () => renderProject(el.dataset.project));
  });
}

function renderProject(projectId) {
  state.view = 'project';
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
        <span class="project-site">${esc(p.website || '')}</span>
      </div>
    </div>
    <div class="accounts-strip">${accounts}</div>
    <h3 class="section-title">Today</h3>
    <div class="post-list">
      ${cards || '<p class="empty-state">Nothing scheduled for today.</p>'}
    </div>
  `;
  document.querySelectorAll('.post-card').forEach((el) => {
    el.addEventListener('click', () => openPost(el.dataset.post));
  });
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
          <p class="media-path">${esc(post.mediaPath || 'No media folder set')}</p>
        </div>
        <div class="modal-section">
          <span class="field-label">Channels</span>
          <div class="ch-tabs">${tabs}</div>
          ${ch ? `
            <div class="ch-panel">
              <div class="ch-panel-head">
                <span class="ch-name">${esc(NETWORK_LABEL[active] || active)}</span>
                <span class="stage-badge stage-${ch.status}">${STAGE_LABEL[ch.status]}</span>
              </div>
              <p class="ch-text">${esc(text)}</p>
              ${ch.text == null ? '<p class="ch-note">Same as master text, edit to adapt it for this channel.</p>' : ''}
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
}

async function init() {
  state.data = await window.api.loadData();
  renderProjects();
  document.getElementById('back-btn').addEventListener('click', renderProjects);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.modal) closeModal();
  });
}

init();
