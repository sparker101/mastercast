const state = {
  data: null,
  view: 'projects',
  projectId: null,
};

const STAGE_ORDER = ['idea', 'draft', 'ready', 'published'];
const STAGE_LABEL = { idea: 'Idea', draft: 'Draft', ready: 'Ready', published: 'Published' };

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
  return `<span class="net-icon ${cls || ''} net-${esc(network)}" title="${esc(network)}">${NETWORK_ICONS[network] || esc(network)}</span>`;
}

function getProject(id) {
  return state.data.projects.find((p) => p.id === id);
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
}

async function init() {
  state.data = await window.api.loadData();
  renderProjects();
  document.getElementById('back-btn').addEventListener('click', renderProjects);
}

init();
