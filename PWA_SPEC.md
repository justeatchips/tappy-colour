# Tappy Colour PWA - Technical Specification v1.1

This is the canonical technical orientation for the active product. The native
iOS project is parked; build work should target the web PWA in `web/`.

Product direction: [TappyColour_PRD_v0.3.md](TappyColour_PRD_v0.3.md)  
Current milestone handoff: [M2_SPEC.md](M2_SPEC.md)

## Stack

- Language: TypeScript strict mode
- Build: Vite
- UI: Vanilla ES modules + Canvas, no framework
- Persistence: IndexedDB via `idb`
- Offline: Service Worker app shell and same-origin asset caching
- Deployment: GitHub Pages via `npm run deploy` from `web/`

## Product Constraints

- The core photo-to-puzzle-to-paint loop is local and offline-first.
- Photos never leave the device for conversion.
- Search is parent-gated, off by default, and visibly unavailable offline.
- The default child path should stay simple: choose source, choose sensible difficulty, paint.
- Do not expose high-resolution experiments in the default path until kid testing proves they help.
- Hex-circle is a child-requested shape option and may stay in the default creation flow if it remains simple, legible, and secondary to starting the puzzle.

## Directory

Implementation lives in `web/src/`.

```text
web/src/
  engine/           pure conversion and grid logic
  model/            artwork, settings, import staging, painting session
  persistence/      IndexedDB setup and artwork codec
  util/             image import, thumbnails, search safety, touch, sound
  views/            vanilla DOM views and canvas UI
  workers/          conversion worker
  router.ts         hash routing and guarded routes
  main.ts           entry point and service worker registration
```
