---
doc: prd
status: approved
---

# Poststage — Product Requirements

A planning control room for a freelance social media manager: projects on top, each project's accounts and today's posts inside, one post with a version per channel, each channel ticked off until published. (Name "Poststage" tentative.)
Source: `scope.md > The Unique Kernel`, `The Core Loop`, `What "Working" Looks Like`, `The POC Boundary`.

## The Core Journey

1. Open the app → see a list of made-up client projects.
2. Click a project → see its name, website link, optional logo, and a row of social media icons with the handle under each; below that, the calendar in Today view with the posts scheduled for today.
3. Click a post card → a popup opens: scheduled date and time, master text, media folder path, and one icon per network the project actually has, each with its own status.
4. Click a network icon → see/edit that channel's text (starting from the master text) and its status; copy button available.
5. Publish on the platform by hand (in the demo video, a mock post screen) → come back and tick that channel "published".
6. Card updates: the overall stage shown is the least advanced of all channel statuses. Close the popup, done.

## Screens and Layout

- **Projects list:** grid or list of project tiles (name + logo if set).
- **Project page:** header (name, website link, logo), accounts strip (network icon + handle + status like "to create"), then Today calendar with post cards.
- **Post card (closed):** title, overall stage badge, tags/icons for the channels it's headed to.
- **Post popup:** scheduled date+time; master text block; media path (clickable to open the folder); one icon per project network showing that channel's status; clicking a network opens its own text + status.

## Look and Feel

Minimal, clean, deliberately not distracting. No decorative surplus. Restrained palette, simple type; project/network identity carried by the network icons and their colors rather than heavy theming.

## Features and Behavior

### Projects and accounts
- As a social media manager, I want to see each client's accounts at a glance so I know what's ready to post.
  - [ ] Projects list shows each project's name (and logo where set).
  - [ ] Project page shows network icon + handle for each account, including accounts marked "to create".
  - [ ] Website link on the project opens the site.

### Today calendar
- As a manager, I want today's posts on one glanceable surface so I know what to work on.
  - [ ] The calendar shows a Today view listing the posts scheduled for today.
  - [ ] Each card shows post title, overall stage badge, and channel tags.
  - [ ] If nothing is scheduled today, the view says so (empty state); demo data includes at least one post for today.

### Post popup — one post, version per channel
- As a manager, I want one post with a separate text and status per channel so I can adapt the message and track each channel independently.
  - [ ] Popup shows scheduled date and time, master text, and media folder path.
  - [ ] Only the networks that have an account on this project appear.
  - [ ] Each network shows its status (not ready → ready → published).
  - [ ] Clicking a network shows its text; channel text defaults to the master text until edited.
  - [ ] A copy button on each channel's text.
  - [ ] Clicking the media path opens the folder where the media is stored.
  - [ ] Ticking a channel "published" updates its status; the card's overall stage = the least advanced channel status (idea/draft if any channel is there, ready only when all channels are ready, published only when all are published).

## States and Boundaries

- **First use** — app opens on the projects list with preloaded demo data.
- **Empty today** — "Nothing scheduled today" (or equivalent); demo data always has at least one post today.
- **Persistence** — edits and status changes survive closing and reopening the app, stored locally.
- **Fresh clone** — whoever downloads the repo starts with the clean demo data; their changes never enter the repo.
- **No passwords** — accounts store platform + handle + status only, never credentials.

## Product Decisions

- No auto-publishing: manual publish + mark-as-published proves the loop; platform APIs deferred (`scope.md > Explicitly Cut`).
- Card stage is *derived* from channel statuses (least advanced wins) rather than set separately — resolves the contradiction between post-level and channel-level stages.
- Channel text inherits master text until edited.
- Demo data preloaded; no create-project/account/post UI in the POC.
- Media = folder path to open, not embedded preview (previews deferred).
- Social media screen in the demo video is a staging prop, not part of the app.

## What We're Building

Projects list; project page (header, accounts strip, Today view); post cards (title, stage, channel tags); post popup (date/time, master text, media path, per-network icon+status+text, copy button, published tick); preloaded demo dataset; local persistence.

## Deferred From the POC

- Creating/editing projects, accounts, posts through UI — demo data suffices to prove the loop.
- Week/month/global calendar views (`scope.md > Later`).
- Image preview of media.
- Auto-publishing via platform APIs.
- Network-level "ready" gates beyond the three statuses.

## Possible Later Enhancements

A real post editor with AI-assisted text variants per channel; reminders for accounts still "to create"; multiple managers/teams.

## Non-Goals

- Publishing or scheduling to platforms automatically.
- Storing credentials.
- Analytics/engagement tracking.
- Multi-user access control.

## Open Questions

- Poststage vs. another name — cosmetic, pick before 6-ship.
- Mock social screen for the video: build a throwaway mock or record a real composer on a test account — decide in 5-build or 6-ship.
