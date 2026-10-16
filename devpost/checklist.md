---
doc: checklist
status: approved
---

# Build Checklist

Build mode: pending — chosen at build start

## Slices

- [ ] **1. Open the app, enter a project, see today's posts**
  Becomes usable: `npm start` opens a real desktop window listing the demo projects. Clicking one shows its header (name, website link, logo placeholder), the accounts strip (network icon + handle + status), and the Today view with post cards (title, stage badge, channel tags). A project with nothing today shows the empty-today message. A corrupt data file reseeds cleanly instead of crashing.
  Why now: Proves the whole path end to end on the first slice — Electron window, data seed, both main screens — so every later slice has somewhere to land. Scaffolding lives here, not as its own step.
  PRD ref: `prd.md > The Core Journey` (steps 1-2), `prd.md > Projects and accounts`, `prd.md > Today calendar`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Components` (Main process, Bridge, Projects list view, Project view), `spec.md > Data Model`, `spec.md > File Structure`, `spec.md > Stack`, `spec.md > Important Failure Modes` (corrupt data)
  Build: `package.json` + `npm install electron`; `main.js` (BrowserWindow, load `planner-data.json` from userData, seed from `data/seed.json` on first run, back up + reseed on corrupt data, `saveData` IPC); `preload.js` exposing `window.api`; `index.html`/`styles.css`/`app.js` rendering projects list and project view with stage badges computed at render; `icons/` with inlined Simple Icons SVGs for the five networks; `data/seed.json` with 3 fictional projects (one with posts today, one empty today, one with a "to_create" account).
  Verify (mechanical): Scratch smoke script launches the app offscreen with a temp `PLANNER_DATA_PATH`, queries the DOM for project tiles and today's cards, captures a screenshot, exits clean. Separately: corrupt the temp data file, relaunch, confirm it reseeds.
  Learner check: Run `npm start`, click into a project, and say whether the overview (accounts strip, today's cards, stage badges) reads the way you pictured.
  Commit: `Scaffold app with projects list and today view`

- [ ] **2. Open a post and see each channel's version**
  Becomes usable: Clicking a post card opens the modal: scheduled date+time, master text, media path (display only for now), and one section per network the project's accounts cover — icon, status, and that channel's text (master text where not yet edited). Networks with no account on the project don't appear.
  Why now: This is the unique kernel — one post, a version per channel — and it must be visible early, not buried at the end. Read-only first so the structure lands before the interactions.
  PRD ref: `prd.md > The Core Journey` (steps 3-4), `prd.md > Post popup — one post, version per channel`
  Spec ref: `spec.md > Components` (Post modal), `spec.md > Look and Feel`, `spec.md > Data Model` (channel text = null inherits master)
  Build: Post modal markup/styles/logic in `index.html`/`styles.css`/`app.js`: master block (datetime, master text, media path) plus per-network sections resolved from the project's accounts, text inheritance, status display, close behavior.
  Verify (mechanical): Smoke script opens a post modal, asserts the channel sections match the project's accounts exactly, and that a null channel text shows the master text.
  Learner check: Open today's post and check that each channel shows its own status and text the way you expected — this is the app's core idea, so say if the layout feels off.
  Commit: `Add post modal with per-channel view`

- [ ] **3. Work the loop: edit, copy, tick published**
  Becomes usable: In the modal, edit a channel's text, press copy (real clipboard), advance a channel's status to published. The card's stage badge recomputes from the least-advanced channel, and everything survives closing and reopening the app.
  Why now: The kernel becomes a loop — adapt, copy, publish by hand, tick off, come back tomorrow. Persistence folds in here because status changes are meaningless if they don't stick.
  PRD ref: `prd.md > The Core Journey` (steps 5-6), `prd.md > Post popup` (copy, statuses, stage derivation), `prd.md > States and Boundaries` (persistence)
  Spec ref: `spec.md > Components` (Post modal, Stage logic), `spec.md > Stack` (clipboard API), `spec.md > Data Model` (saved after every edit)
  Build: Editable channel text (writes to channel `text`, overriding master), status control cycling idea/draft/ready/published, copy button via `window.api.copyText` → `clipboard.writeText` in main, save-through on every change via `saveData`, stage badge recompute on render.
  Verify (mechanical): Smoke script sets a channel status through the DOM, confirms the temp JSON file on disk reflects it, relaunches and confirms the state persists and the stage badge recomputed; clipboard assert via `clipboard.readText` after a simulated copy.
  Learner check: The real loop — open today's post, tweak the Instagram text, copy it, tick Instagram published, close and reopen the app, and confirm it stuck and the card badge moved.
  Commit: `Add channel editing, copy, and status tracking`

- [ ] **4. Real hooks and polish**
  Becomes usable: The media path opens the real folder in Explorer (bundled `demo-media/` samples), the project website link opens in the browser, a missing folder shows a readable error next to the link, and a failed copy says so. Visual pass brings everything in line with the spec's minimal look.
  Why now: Last, because it's the outside-world wiring — folder opening and external links — plus the look-and-feel pass that is cheapest to do once all the screens exist.
  PRD ref: `prd.md > Post popup` (media path opens folder), `prd.md > Projects and accounts` (website link), `prd.md > Look and Feel`
  Spec ref: `spec.md > Stack` (shell API), `spec.md > Important Failure Modes` (missing folder, clipboard failure), `spec.md > Look and Feel`, `spec.md > File Structure` (demo-media/)
  Build: `openMediaFolder` and `openExternal` IPC in `main.js`/`preload.js`; `demo-media/` sample folders; media-path click resolves seed-relative paths to absolute; "Folder not found" and "Couldn't copy" error states; styles.css polish pass (palette, whitespace, hover, icon colors by status).
  Verify (mechanical): Smoke script calls `openMediaFolder` on a bundled demo path (expect success) and a bogus path (expect the error string the modal displays); screenshot review of all three screens against the Look and Feel spec.
  Learner check: Click the media path in a post — Explorer should open on the demo folder. Then a last look at the whole app: does it feel like the clean control room from the plan?
  Commit: `Open media folder and website, polish look`

## Hands-on Checkpoints

- [ ] Early usable behavior explored — after slice 2, when the kernel (one post, per-channel versions) is on screen and layout feedback can still shape slices 3-4
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence:
Route and stops:
Edit outcome:
Reflection:
Activity mode:

## Revisions
