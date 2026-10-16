const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

const SEED_PATH = path.join(__dirname, 'data', 'seed.json');
const DATA_PATH = process.env.PLANNER_DATA_PATH || path.join(app.getPath('userData'), 'planner-data.json');

function resolveSeed(seed) {
  const data = JSON.parse(JSON.stringify(seed));
  const now = new Date();
  for (const project of data.projects) {
    for (const post of project.posts || []) {
      if (post.dayOffset !== undefined) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + post.dayOffset);
        post.datetime = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${post.time || '09:00'}`;
        delete post.dayOffset;
        delete post.time;
      }
      if (post.mediaPath && !path.isAbsolute(post.mediaPath)) {
        post.mediaPath = path.join(__dirname, post.mediaPath);
      }
    }
  }
  return data;
}

function loadData() {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    return resolveMediaPaths(data);
  } catch (err) {
    if (fs.existsSync(DATA_PATH)) {
      fs.copyFileSync(DATA_PATH, DATA_PATH.replace(/\.json$/, `.broken-${Date.now()}.json`));
    }
    const seed = resolveSeed(JSON.parse(fs.readFileSync(SEED_PATH, 'utf8')));
    fs.writeFileSync(DATA_PATH, JSON.stringify(seed, null, 2));
    return seed;
  }
}

function resolveMediaPaths(data) {
  for (const project of data.projects || []) {
    for (const post of project.posts || []) {
      if (post.mediaPath && !path.isAbsolute(post.mediaPath)) {
        post.mediaPath = path.join(__dirname, post.mediaPath);
      }
    }
  }
  return data;
}

function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  return { ok: true };
}

function createWindow() {
  const smoke = process.env.PLANNER_SMOKE;
  const win = new BrowserWindow({
    width: 1024,
    height: 720,
    show: !smoke,
    title: 'Poststage',
    backgroundColor: '#f7f7f5',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  win.setMenuBarVisibility(false);
  win.loadFile('index.html');

  if (smoke) {
    win.webContents.once('did-finish-load', async () => {
      try {
        const expr = fs.readFileSync(smoke, 'utf8');
        const result = await win.webContents.executeJavaScript(expr);
        console.log('SMOKE_RESULT ' + JSON.stringify(result));
        if (process.env.PLANNER_SMOKE_SHOT) {
          await new Promise((r) => setTimeout(r, 400));
          const img = await win.webContents.capturePage();
          fs.writeFileSync(process.env.PLANNER_SMOKE_SHOT, img.toPNG());
        }
        app.exit(result && result.ok === false ? 1 : 0);
      } catch (err) {
        console.error('SMOKE_ERROR', err);
        app.exit(2);
      }
    });
  }
}

app.whenReady().then(() => {
  ipcMain.handle('data:load', () => loadData());
  ipcMain.handle('data:save', (_event, data) => saveData(data));
  createWindow();
});

app.on('window-all-closed', () => app.quit());
