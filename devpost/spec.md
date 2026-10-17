---
doc: spec
status: approved
---

# Mastercast — Technical Spec

## How This Works, In Plain Language

A desktop app built with Electron — the same technology as The Pool. Electron runs a real app window powered by a web page inside it: the screens are ordinary HTML, CSS and JavaScript, but the app can also do desktop things a browser can't, like open a folder on your laptop or write to the clipboard.

There are two halves. The **main process** (`main.js`) is the desktop side: it opens the window, reads and writes your data file, opens the media folder, and puts text on the clipboard. The **renderer** (`index.html` + `app.js` + `styles.css`) is the visible side: the screens, cards and popup you click around in. They talk through a small bridge (`preload.js`) so the page can ask the desktop side to do things.

Your planner data (projects, accounts, posts, statuses) lives in a JSON file — a structured text file — saved in the app's own storage area on your machine. The first time the app runs, it copies the bundled demo dataset there. Your edits write back to it, so everything is still there when you reopen the app. Because the file lives outside the project folder, anyone who downloads the repo from GitHub starts with a fresh copy of the demo data — nothing you change is ever in the repo.

Why this shape: it keeps the whole core loop real (copy text, open the real media folder, tick published, come back tomorrow) with no server, no accounts and no build step.

## The Core Journey Through the System

PRD ref: `prd.md > The Core Journey`.

1. Launch → `main.js` opens the window, looks for the data file in the app storage folder → not found on first run → copies `data/seed.json` there → sends the data to the page.
2. Page renders the **projects list** from that data.
3. Click a project → page renders the **project view**: header, accounts strip, Today view filtered to posts whose scheduled date is today.
4. Click a post card → the **post modal** opens: date/time, master text, media path, one icon per network the project's accounts cover, each showing its status.
5. Click a network icon → shows that channel's text (master text if no override) and status → edit text or press copy → `preload.js` asks `main.js` to write the text to the clipboard.
6. Click the media path → `preload.js` asks `main.js` to open the folder in Windows Explorer.
7. Tick "published" on a channel → page updates the channel status, writes the whole dataset back through `main.js` → the card's stage badge recomputes from the least advanced channel.

## Stack

- **Electron** (latest stable; `npm install electron`) — desktop shell. Docs: https://www.electronjs.org/docs
- **Plain HTML/CSS/JavaScript** for the renderer — no framework, no bundler.
- **JSON file** for persistence via Node's `fs` in the main process.
- **Simple Icons** (CC0) — brand SVG marks for Instagram, TikTok, Pinterest, X, YouTube, inlined into the page. https://github.com/simple-icons/simple-icons
- **electron clipboard API** — `clipboard.writeText`. Docs: https://www.electronjs.org/docs/latest/api/clipboard
- **electron shell API** — `shell.openPath` for the media folder. Docs: https://www.electronjs.org/docs/latest/api/shell
- **nodeIntegration off, contextIsolation on** (Electron defaults) — page talks to main only through `preload.js` bridge.

## Where It Runs and How Someone Tries It

- Windows desktop app, runs locally; requires Node.js + npm only to develop/launch (`npm install`, `npm start`).
- `npm start` = `electron .` → window opens on the projects list.
- Demo recording: launch, open a project, open today's card, copy channel text, open the media folder, tick published, close.
- Public GitHub repo: https://github.com/sparker101/mastercast — code + `data/seed.json` + a `demo-media/` folder; the live data file stays in app storage, never committed. Deployment is optional and not needed — the video shows it working.
- Demo video URL: (pending — add when uploaded)

## Look and Feel

Minimal, clean, deliberately not distracting (`prd.md > Look and Feel`). Light background, near-black text, one quiet accent color for interactive elements, lots of whitespace, no gradients or decoration. System-ui font stack. Channel identity comes from the brand icons and their status colors: muted gray = not ready, accent color = ready, green/check = published. Cards are flat, lightly bordered, subtle shadow on hover. Interface copy is short and functional.

## Components

### Main process (`main.js`)
Creates the BrowserWindow, loads the data file (seeding from `data/seed.json` on first run), saves data, exposes `openMediaFolder` and `writeClipboard` via IPC.
PRD ref: `prd.md > Post popup — one post, version per channel`, `States and Boundaries` (persistence).

### Bridge (`preload.js`)
Exposes a tiny `window.api` to the page: `loadData`, `saveData`, `openMediaFolder(path)`, `copyText(text)`.

### Projects list view
Renders project tiles (name + logo placeholder). Click → project view.
PRD ref: `prd.md > Projects and accounts`.

### Project view
Header (name, website link, logo), accounts strip (network icon, handle, status incl. "to create"), Today view listing today's post cards (title, stage badge, channel tags) or the empty-today message.
PRD ref: `prd.md > Projects and accounts`, `Today calendar`.

### Post modal
Master block (scheduled date+time, master text, media path link), then one tab/section per network present in the project's accounts: channel text (inherits master until edited), status control (not ready → ready → published), copy button, "published" tick.
PRD ref: `prd.md > Post popup — one post, version per channel`.

### Stage logic (in `app.js`)
Overall post stage = least advanced of the post's channel statuses (`idea < draft < ready < published`). Computed at render time, never stored.
PRD ref: `prd.md > Post popup` (stage derivation), `Product Decisions`.

## Data Model

One JSON file: `<userData>/planner-data.json` (Electron `app.getPath('userData')`). Seeded from `data/seed.json` on first run. Saved after every edit. Data lives: on disk in that file → loaded into page memory on launch → saved back on change → survives restarts.

```jsonc
{
  "projects": [
    {
      "id": "proj-1",
      "name": "Acme Bakery",
      "website": "https://example.com",
      "logo": null,                    // optional asset path
      "accounts": [
        { "network": "instagram", "handle": "@acmebakery", "status": "active" },
        { "network": "tiktok",    "handle": "",            "status": "to_create" }
      ],
      "posts": [
        {
          "id": "post-1",
          "title": "New menu launch",
          "datetime": "2026-10-16T09:00",
          "masterText": "Exciting news from Acme...",
          "mediaPath": "demo-media/acme/",   // resolved to absolute at runtime
          "channels": {
            "instagram": { "text": null, "status": "ready" },     // text=null → inherits master
            "tiktok":    { "text": null, "status": "draft" }
          }
        }
      ]
    }
  ]
}
```

Networks: `instagram`, `tiktok`, `pinterest`, `x`, `youtube`. Channel statuses: `idea`, `draft`, `ready`, `published`. Account statuses: `active`, `to_create`.

## File Structure

```
social-media-planner/
├── main.js              # Electron main: window, data load/save, openPath, clipboard (IPC)
├── preload.js           # contextBridge → window.api
├── index.html           # single page: projects view + project view + post modal
├── styles.css           # minimal/clean styling
├── app.js               # renderer logic: render, edit, statuses, stage computation
├── data/
│   └── seed.json        # bundled demo dataset (2-3 fictional projects, posts for today)
├── demo-media/          # sample images the media link opens
│   └── acme/
├── icons/               # inlined brand SVGs from Simple Icons
├── devpost/             # Devpost learning workspace
├── package.json
└── README.md
```

## External Services and Dependencies

None at runtime. `electron` via npm is the only dependency (docs linked above). Network icons use Simple Icons' CC0-licensed SVGs; the brand marks are trademarks, used here only to label platforms (standard nominative use) — fine for a demo, noted if the tool were ever commercialized.

## Important Failure Modes

- **Data file corrupted or unreadable** → on load failure, back it up (`planner-data.broken-<timestamp>.json`) and reseed from `data/seed.json`, so the app always opens.
- **Media folder path doesn't exist** → `openMediaFolder` returns an error; modal shows "Folder not found: &lt;path&gt;" next to the link.
- **Clipboard write fails** → copy button briefly shows "Couldn't copy — select the text manually".

## What Was Simplified and Why

- **Single page, view switching in JS** instead of a router/framework — three views don't justify React or a build step.
- **JSON file in `userData`** instead of a database — same shape of data, zero infrastructure; also gives fresh-clone-resets for free.
- **Stage derived at render** instead of stored — single source of truth (channel statuses); impossible to get out of sync.
- **`mediaPath` opens a folder** instead of previewing images — previews deferred (`prd.md > Deferred`).
- **No create-UI; seeded demo data** — proves the loop in one minute without form-building (`prd.md > Product Decisions`).

## Decisions and Open Issues

- **Electron over web page** — learner choice: real folder opening + real file persistence, matching The Pool's proven setup; tradeoff = slightly more install weight than a browser page.
- **Vanilla JS renderer over framework** — learner-approved recommendation: smallest thing that works.
- **Brand icons via Simple Icons inline SVGs** — learner asked about copyright; clarified: marks are trademarked not copyright-blocked for labeling use, Simple Icons is CC0 for the SVG files. That was the one genuine uncertainty, now resolved.
- **Data in `userData`, seed in repo** — gives persistence for Filippo and a clean first-run demo for anyone cloning.
- Resolved in `6-ship`: final app name is **Mastercast** (see `prd.md > Open Questions`).
- Open (demo staging): mock social screen vs. recording a real composer — decide during `5-build`/`6-ship`; the planner itself doesn't depend on it.
