---
doc: scope
status: approved
---

# Social Media Planner (working title)

A planning control room for social media posts across many projects: one post, a version for each channel, each channel tracked until it's marked published.

## The Unique Kernel
One post, a version for each channel. Each post carries its own text for each account (Instagram, TikTok, Pinterest, X, YouTube Shorts...) and its own "published" tick for each channel, all organized by project. This is what Notion couldn't do: the calendar and "a clear understanding of the post that I was making" live in the same place. No channel-slot limits, no subscription.

## Who It's For
A freelance social media manager juggling several clients/projects, each with its own set of accounts. Filippo is the first user (multiple websites and side projects to promote; Instagram main, plus Pinterest, X, some TikTok). Today they use Hootsuite (too expensive, "not enough social media channel slots") or a Notion calendar disconnected from the actual post content.

## The Core Loop
Open the tool → see today's posts → open a post → copy the text for one channel → open the media folder link → publish by hand on the platform → come back and mark that channel as published. Repeat for each channel. They come back daily to see what still needs doing today.

## Inspiration & Identity
Hootsuite (scheduling at scale), Buffer, Later, Metricool, Meta Business Suite scheduler, Notion calendar. Should feel like a clear, uncluttered overview of "what I need to publish, what I am planning, what stage the posts are at." Visual direction to be settled in the PRD.

## Why This Matters to the Learner
Replaces the paid tools he outgrew and the Notion setup that didn't connect plan and content. Learning goals: "an efficient way of working with agents" and "what is possible to do now in social media management."

## What "Working" Looks Like
Demo video, about a minute: a few made-up client projects on screen → enter one → see its accounts → open a post in today's view → tweak and copy the Instagram text → paste it into a (mock) social post screen → click the folder link, grab the image, attach it → publish, the post appears in a feed → back in the planner, tick "published" for Instagram → close the card.
The "oh, that's cool" beat: one post, one channel ticked off, while the other channels still show as pending.

## The POC Boundary
- Projects list
- Project page: its social accounts (platform, handle, status such as "to create"; never passwords)
- Today calendar view (the only calendar view)
- Post cards with tags for each channel
- Post detail: text for each channel with a copy button, media as a folder link
- Published checkbox for each channel
- Post stage (idea → draft → ready → published) shown on the card alongside the channel ticks
- Made-up demo data (fictional client projects)

## Later
- Month and week calendar views
- Global calendar across all projects
- Image previews of the media (instead of a folder link only)
- Auto-publishing through platform APIs, once the planner is "at a very functional level"

## Explicitly Cut
- Auto-publishing in this proof of concept: platform APIs, app reviews and account authorization are "a lot of things involved"; manual publish + mark as published proves the loop.
- Storing passwords/credentials for accounts: handles only.
- The mock social post screen as an app feature: it's a demo-video prop, not part of the planner.
