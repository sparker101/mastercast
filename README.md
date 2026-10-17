# Mastercast

A proof-of-concept desktop app: a planning control room for social media posts across multiple projects. One post carries a text version and a publish status for each channel — you adapt the text per channel, copy it, publish by hand on the platform, and tick that channel off.

Built for the Build With AI: Basics hackathon with a plan-first workflow. Planning docs live in `devpost/` (scope, PRD, spec, build checklist, app map).

## Run it

Requires Node.js and npm.

```bash
npm install
npm start
```

`npm start` opens an Electron window seeded with fictional demo projects on first run.

## How it works

- `main.js` — Electron main process: window, JSON data load/save, clipboard and media-folder IPC.
- `preload.js` — `window.api` bridge between page and desktop.
- `index.html`, `styles.css`, `app.js` — the screens: projects list, project view with Today's posts, post modal with per-channel text, status, and copy button.
- `data/seed.json` — bundled demo dataset (fictional projects), copied to app storage on first run.
- `demo-media/` — sample images the media folder link opens.
- `icons/` — network brand SVGs (Simple Icons, CC0).

Edits and status changes persist in `planner-data.json` inside the app's own storage folder — outside this directory — so a fresh clone always starts clean on the demo data.
