# Tappy Colour — Claude Code Guide

## Project overview

Tappy Colour is an offline-first colour-by-numbers app for kids (6–10 years old). It converts any photo into a pixel-art grid puzzle that kids paint square by square. The core colouring loop works entirely offline; internet is only used for safe image search (a later milestone).

**This file covers the web PWA only.** The native iOS app in `TappyColour/` is parked for now.

Full product requirements: [TappyColour_PRD_v0.2.md](TappyColour_PRD_v0.2.md)  
M1 technical spec: [M1_SPEC.md](M1_SPEC.md)

---

## Tech stack

- **Language:** TypeScript (strict mode)
- **Build tool:** Vite 5.4
- **UI pattern:** Vanilla ES modules + Canvas — no framework
- **Persistence:** IndexedDB via `idb` v8
- **Offline:** Service Worker
- **Deployment:** GitHub Pages (`npm run deploy`)
- **Runtime target:** ES2022

---

## Development commands

All commands run from the `web/` directory.

```bash
npm run dev       # Vite dev server (port 5173–5174)
npm run build     # TypeScript check + Vite production build
npm run preview   # Local preview of production build
npm run test      # Run unit test suite
npm run deploy    # Build + push to GitHub Pages (gh-pages)
```

Always run `npm run build` before reporting a task complete to catch type errors.

---

## Current milestone: M2 — Local sources

**M1** (core engine) is done: conversion pipeline, tap/drag painting, save/resume, difficulty slider.

**M2 goal:** Photo library import, camera capture, and a gallery of saved pieces.

Milestone roadmap from the PRD:

| Phase | Focus | Status |
|-------|-------|--------|
| M1 | Core engine | Done |
| M2 | Local sources | **In progress** |
| M3 | Painting tools & palette | Upcoming |
| M4 | Safe search | Upcoming |
| M5 | Polish | Upcoming |
| M6 | Family testing | Upcoming |

---

## Architecture

```
web/src/
  engine/           # Pure logic — KMeansQuantiser, ImageConverter, PixelGrid, Palette, ConversionSettings
  model/            # Artwork, ArtworkStore (IndexedDB), PaintingSession
  views/            # HomeScreen, DifficultyPicker, PuzzleContainer, GridCanvas, PaletteStrip, CompletionOverlay
  persistence/      # db.ts (IndexedDB setup), codec.ts (encode/decode)
  workers/          # conversion.worker.ts (background conversion)
  util/             # events.ts, touch.ts, sound.ts, rgb.ts
  router.ts         # Hash-based routing (#home, #difficulty/*, #puzzle/*)
  main.ts           # Entry point, ServiceWorker registration
```

**Core conversion pipeline:**
```
Image → resize to gridSize×gridSize → k-means quantise → PixelGrid + Palette
```

Difficulty slider (0.0–1.0) maps to grid size 16×16 → 80×80 and palette size 6 → 24 colours.

Grid cells are 1 byte each (bit 7 = painted, bits 0–6 = palette index), so even the max 80×80 grid is ~6 KB on disk.

---

## Testing

- Write tests for all new logic. If a bug is found, add a regression test before fixing it.
- Run the test suite (`npm run test`) as part of every code change.
- Run `npm run build` to catch type errors before marking anything done.
- Engine and model layers should be unit-testable in isolation — keep them free of DOM/browser dependencies.

---

## Model roles

Unless told otherwise:
- **Planning** (architecture decisions, milestone scoping, approach): use **Opus**
- **Building** (implementation, editing files, writing tests): use **Haiku**
- **Reviewing** (code review, checking output quality): use **Sonnet**

---

## Git workflow

- Commit after every meaningful change — don't batch unrelated work into one commit.
- Push after each commit so progress is backed up continuously.
- Write concise commit messages focused on *why*, not *what*.

---

## Deployment

Target: GitHub Pages.  
Command: `npm run deploy` (builds and pushes via `gh-pages`).  
**Note:** GitHub Pages must be manually activated in the repo Settings → Pages before the first deploy will be live.

---

## Key constraints

- **No framework.** The web app uses vanilla ES modules and Canvas. Don't reach for React, Vue, etc.
- **No telemetry, no accounts.** Photos never leave the device.
- **Offline first.** Every feature except safe search must work without an internet connection.
- **60fps painting.** Canvas rendering on an 80×80 grid must stay smooth; profile before reaching for optimisations.
- **44pt touch targets.** Apple HIG minimum — important for small fingers.
- **Kid-readable UI.** Prefer icons and numbers over text. Minimal copy.
