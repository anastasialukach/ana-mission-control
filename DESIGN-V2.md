# Mission Control V2 — Design Spec

## Vision
Transform from personal dashboard → open-sourceable product that looks premium enough to go viral on X/LinkedIn. Potential standalone product for founders/investors.

## Design References (Ana's picks)
1. **Warm gradient mobile** (wallet app) — orange→pink→white gradient, generous whitespace, clean type
2. **ORION dark dashboard** — dark + neon green, glassmorphism, circular progress, rich data viz
3. **OrderFlow** — light theme, left sidebar, green accents, friendly cards
4. **Zetizen Analytics** — cream/warm palette, coral/terracotta, data charts, sidebar
5. **Crextio HR** — warm yellow gradient header, mixed panels, calendar, progress widgets
6. **JUICE dark** — dark + colorful neon gradients, profile panel, platform integrations

## Design Principles (extracted)
- **Soft gradients** — warm tones (amber, coral, peach), not harsh neon
- **Card-based layout** — generous padding (20-24px+), large border-radius (16-24px)
- **Big bold stat numbers** — hero element of every card
- **Left sidebar nav** — icon + label, collapsible, mobile drawer
- **Glassmorphism** — subtle blur/transparency on cards
- **Two themes** — dark (charcoal + amber/green accents) and light (cream/warm + coral)
- **Premium fintech feel** — Bloomberg Terminal meets Apple design
- **Typography-forward** — editorial, not startup-scrappy
- **Wider spacing** — elements breathe, not cramped

## Process (from Frederik's "Don't Look Vibecoded" PDF)
1. PRD first (done — we know all screens)
2. Prototype functionality (done — V1 works)
3. Screen inventory (need to formalize)
4. Design exploration (use v0, Variant AI, etc.)
5. Apply design system across all pages

## Screen Inventory
### Core Pages
- Dashboard (home) — stats overview, quick actions, recent activity
- Calendar / Daily Briefing — news + posts + metrics tracking
- Job Tracker — 222 jobs, filters, status management
- Kanban — task board (todo/in-progress/done)
- Content Hub — scripts, hooks, posting strategy
- Outreach — email templates, personalization

### Founder/Investor Tools (product potential)
- LP Readiness Score
- Founder Update Generator
- Manager Intelligence
- Event Intel Generator

### Reference Pages
- Tier 1 Targets
- Tier 2 Outreach
- Articles (1, 2)
- Research, Profile, Criteria, TOV
- CVs, Cover Letters

## Architecture
```
ana-mission-control/
├── src/
│   ├── components/     # Sidebar, cards, charts, theme toggle
│   ├── pages/          # All screens
│   ├── styles/         # CSS custom properties, themes, gradients
│   ├── api/            # D1 sync layer
│   └── utils/
├── functions/          # Cloudflare Pages Functions (API)
├── public/             # Static assets
└── wrangler.toml
```

## Tech Stack
- Vanilla JS (no frameworks)
- CSS custom properties for theming
- Cloudflare Pages (hosting) + D1 (database) + Workers (API)
- GitHub repo as source code
- Mobile-first, responsive

## Goals
- [ ] Open-sourceable quality
- [ ] Screenshot-worthy for X/LinkedIn virality
- [ ] Dark + Light theme toggle
- [ ] Sidebar navigation
- [ ] Soft gradient design language
- [ ] Standalone founder tools as potential product
- [ ] Proper component architecture
