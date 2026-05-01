# Tappy Colour - PRD v0.3.3

**Product Requirements Document**

**Tappy Colour**

*A colour-by-numbers web PWA for kids, built around personal photos, offline play, and parent trust*

Version 0.3.3 | Draft | May 2026

---

## Change Log

**v0.3.3** - M2 backlog pass: simplified the conversion preview default path by deferring fine-tuning controls behind MORE, made Home's disabled Search state visible for parent-off/offline cases, added import-queue visibility, and clarified the target-device QA capture needed before M2 ships.

**v0.3.2** - Added durable child profile persistence as the top trust requirement. Child identity/settings such as mascot, search access, sound, auto-fill, adult gate, and default difficulty must survive app improvements through IndexedDB-backed profile storage, with localStorage treated only as a fast cache.

**v0.3.1** - Kept hex-circle puzzle mode in the M2 creation path because it is a specific child-user request. It should remain simple, legible, and secondary to starting the puzzle.

**v0.3** - Recentered the product around the active web PWA. Replaced native iOS requirements with browser/PWA requirements. Made "one child can create and finish one personally meaningful picture without adult help" the north-star flow. Tightened M2 around local photo/camera sources, gallery confidence, offline behavior, and storage recovery. Moved super-high-resolution mode, broad export/share, and advanced creation options to backlog until kid testing proves demand. Clarified that safe search exists as scaffolded code but remains parent-gated, default-off, and not part of the M2 core.

**v0.2** - Renamed to Tappy Colour. Difficulty progression made free-flowing rather than tiered. Added fill-by-number, bucket fill, suggested palettes, and palette editing. Export/share moved to backlog. Added Testing & Development section.

**v0.1** - Initial draft.

---

## 1. Product Thesis

Tappy Colour is an offline-first tablet web PWA that turns a child-owned source image into a colour-by-numbers pixel puzzle. A child can choose a starter picture, import a family photo, or take a new photo; the app converts it locally; the child paints by matching numbers; and the finished picture becomes a small pride object they can revisit.

The product is for family iPads and tablet browsers. The native iOS app in `TappyColour/` is parked for now and is not the canonical v1 product.

The core promise is:

> A child can make and finish one personally meaningful picture without adult help.

Every new feature must either help the child start, keep going, finish, or proudly revisit a picture. Features that mainly express technical possibility move to backlog.

---

## 2. Goals and Non-Goals

### 2.1 Goals

- **Personal-picture magic.** The strongest moment is seeing a pet, drawing, toy, family photo, or camera snap become a puzzle.
- **Offline by default.** Starter pictures, local photo import, camera capture where available, conversion, painting, save/resume, and gallery all work after the app shell is loaded.
- **Kid-readable.** A 6-10 year old should understand the next action from icons, numbers, colour, and layout, with minimal reading.
- **Parent trust.** No accounts, ads, telemetry, remote photo processing, or surprise network use in the core loop.
- **Completion confidence.** Difficulty, tools, hints, auto-fill, and encouragement exist to help kids finish, not to make the app feel complex.
- **Low-friction creation.** The default path should be short: pick a picture, choose a sensible difficulty, start painting.
- **Tablet-first PWA quality.** The app should feel intentionally built for iPad/tablet touch, not like a desktop webpage squeezed onto a device.

### 2.2 Non-Goals for v1

- Native iOS implementation work.
- Social features, accounts, cloud sync, leaderboards, or sharing feeds.
- Monetisation: no ads, in-app purchases, subscriptions, or upsells.
- AI-generated imagery from prompts or speech.
- Multiplayer or collaborative colouring.
- Arbitrary high-resolution puzzle creation above the proven 80x80 cap.
- Search-first usage. Safe search is a parent-enabled supplement, not the main creation path.
- Rich photo editing, album management, or metadata browsing.

---

## 3. Users

### 3.1 Primary User: Child

- **Age:** 6-10.
- **Reading level:** Developing; prefers icons, numbers, short labels, and visual state.
- **Motor skills:** Comfortable with taps, drags, and pinch zoom; needs forgiving targets and clear feedback.
- **Context:** Family iPad/tablet, car trips, quiet time, flights, offline use, intermittent adult help.
- **Motivation:** "I made this." Completion, recognition, and pride matter more than feature depth.

### 3.2 Secondary User: Parent

Parents set up the app, approve search, manage storage/deletion, and decide whether the app is safe enough to remain on the device. They are not the daily user, but their trust is non-negotiable.

Parent requirements:

- The child's profile survives app updates and is not reset by routine product changes.
- Photos never leave the device for conversion.
- Search is off by default and visibly parent-controlled.
- Destructive actions are parent-gated or strongly confirmed.
- Offline behavior is honest.
- Storage issues are recoverable without losing the child's current effort.

---

## 4. Product Principles

1. **The canvas is the main event.** UI chrome supports the picture; it should not compete with it.
2. **Prefer a working default over configuration.** Advanced controls are useful only when they prevent frustration.
3. **Make the next tap obvious.** The child should always know what to touch next.
4. **Celebrate progress, not just completion.** Finishing a colour, finding the next square, and coming back later should feel rewarding.
5. **Keep parent controls out of the child flow.** Settings, destructive actions, and search controls belong behind the adult gate.
6. **No hidden network dependency.** If a feature needs internet, it should look unavailable when offline.
7. **Local-first data ownership.** Images, puzzles, settings, and progress live on the device.

---

## 5. Core Journey

The product strategy is built around this journey:

1. **Choose or create source image.**
   - Starter picture, photo import, camera capture, or later parent-enabled search.
2. **Convert into puzzle.**
   - Sensible default difficulty, simple preview, optional fit/fill crop choice.
3. **Understand what to do.**
   - Pick a colour/number, tap matching cells, see progress.
4. **Paint successfully.**
   - Tap, drag, bucket, fill-all, undo, hint, zoom/pan, wrong-tap feedback.
5. **Feel proud.**
   - Numbers fade, grid lines disappear, completion animation, source/painting compare.
6. **Return later.**
   - Gallery thumbnails, progress state, exact resume, completed picture viewing.

---

## 6. Functional Requirements

### 6.1 Home and Gallery

- Home shows three creation actions: Camera, Photos, and Search.
- Search is disabled by default and when offline. Disabled state should be visible, not only conveyed by hover/title text.
- Starter pictures remain available so a child can play without importing anything.
- The gallery shows saved pictures and remaining starter pictures without duplicates.
- Saved gallery cards show thumbnail, title, completion/progress state, and open/resume behavior.
- Child gallery cards do not expose destructive delete controls.
- Parent settings include picture management for selecting and deleting saved artworks.

### 6.2 Local Photo Import

- Use browser file input with `accept="image/*"`.
- Photo import may allow multiple selections, but the product path should remain one image at a time through difficulty and conversion.
- The app should not show camera-roll metadata such as dates, locations, or albums to the child.
- Decode images locally, respect EXIF orientation where browser support allows, and downscale large inputs before conversion.
- Reject non-images and overly large images with clear, friendly errors.
- Store an offline thumbnail and source-image copy when storage allows, so completed pictures can compare painting vs source.
- No app-level arbitrary gallery cap. Storage pressure is handled through error messaging and parent picture management.

### 6.3 Camera Capture

- Use capture-enabled browser file input (`capture="environment"`) where supported.
- On browsers that do not provide direct camera capture, fall back to the normal image picker.
- After capture, route directly to the conversion preview.
- Captured images are not uploaded and are not automatically saved outside the app.
- Camera failures and cancellations should return the child to Home without a broken state.

### 6.4 Safe Internet Image Search

Search is a later milestone feature even though implementation scaffolding exists.

- Search is parent-enabled and off by default.
- Search requires network and is visibly unavailable offline.
- Queries pass through conservative child-safe sanitisation before any request.
- Results come from a licensed-image provider such as Openverse.
- Provider SafeSearch is always requested.
- Results are filtered client-side using provider flags, metadata, blocked terms, usable image URL checks, and descriptive-safety checks.
- Attribution is stored with search-sourced artwork and available to parents later.
- Search must never be treated as "fully safe"; it is a parent-controlled feature with conservative filtering and ongoing test fixtures.

### 6.5 Conversion Preview and Difficulty

- Difficulty maps continuously from 16x16 / 6 colours to 80x80 / 24 colours.
- Default difficulty starts easy and may be parent-configured.
- The preview should help the child avoid frustration, not become an expert editor.
- Fine-tuning controls such as the slider, meter, and stats should stay behind MORE by default so START remains the obvious next action.
- Required controls for M2:
  - difficulty slider or clearly tappable easy/medium/hard preview cards
  - a simple start action
  - fit/fill crop choice only if understandable at a glance
- The preview may show estimated completion time and tiny-cell warnings.
- Hex-circle is available as a child-requested shape option. It should remain visually understandable and secondary to starting the puzzle.
- Additional advanced shape modes are not part of the default child path.
- Conversion happens locally in the browser, preferably off the main thread.

### 6.6 Painting Experience

Painting modes:

- **Tap.** Paint one matching cell.
- **Drag.** Paint matching cells while dragging.
- **Bucket.** Fill one connected region of the selected number.
- **Fill all.** Fill all remaining cells of the selected number.

Painting requirements:

- Wrong-number taps are gently rejected without changing state.
- Each mode action is one undo step.
- Auto-advance selects the next incomplete colour when the current colour is finished.
- Hint briefly highlights remaining cells for the selected colour without painting for the child.
- Palette entries show number, swatch, and progress.
- Palette colour editing is available via long press, but it should not be promoted ahead of the basic painting loop.
- Completed puzzles hide numbers and grid lines, then show a celebration.

### 6.7 Save, Resume, and Local Persistence

- Child profile settings are persisted durably in IndexedDB and mirrored to localStorage as a fast cache.
- Startup hydrates the local settings cache from the durable profile before routing.
- The durable profile includes mascot, search access, sound, auto-fill, default difficulty, and adult gate state.
- Save progress after every meaningful action, debounced where appropriate.
- Flush pending saves on page hide/visibility change.
- Resume restores:
  - grid state
  - palette edits
  - selected colour
  - selected tool
  - completion state
  - source metadata and source image when available
- IndexedDB is the source of truth for saved artworks.
- LocalStorage may hold lightweight settings only.
- Storage failures must surface as user-visible messages and point to parent picture management.

### 6.8 Parent Settings

Settings are adult-gated with a lightweight arithmetic challenge. This is an adult check, not a security guarantee.

Settings include:

- Sound effects on/off.
- Internet search on/off.
- Background auto-fill on/off.
- Default difficulty.
- Change adult code.
- Select/delete saved pictures.
- Delete all pictures.

Settings should use clearer parent-facing copy than the child game UI.

---

## 7. Non-Functional Requirements

### 7.1 Platform

- Canonical v1 platform: tablet-first web PWA.
- Primary target: iPad Safari and installed iPad PWA.
- Secondary target: modern Chromium tablet/desktop browsers for development and family use.
- Build system: Vite + TypeScript.
- UI: vanilla ES modules + Canvas, no framework.
- Persistence: IndexedDB via `idb`.
- Offline: Service Worker app shell and same-origin asset caching.

### 7.2 Performance

- Cold launch to Home in under 2 seconds after app shell is cached.
- Conversion under 3 seconds at default difficulty on a supported tablet.
- 60fps painting target at 80x80.
- Main-thread painting interactions should not stall during drag paint.
- Number labels hide when cells are too dense to read and reappear when zoomed.
- Do not ship grids above 80x80 without cached rendering, viewport culling, profiling, and a product reason.

### 7.3 Privacy and Safety

- No accounts.
- No telemetry or analytics.
- No ads or third-party trackers.
- No remote photo conversion.
- Search is the only intended network feature after app load and is parent-controlled.
- Service worker must not cache third-party search responses or image results indefinitely.
- Saved source images remain local to IndexedDB.

### 7.4 Accessibility

- Interactive controls are at least 44px by 44px.
- Palette colours always include number labels.
- Icon-only controls require accessible labels.
- Preserve native button/input semantics.
- Focus states are visible.
- Reduced-motion preference is respected.
- Parent settings should be usable with keyboard and assistive tech.

### 7.5 Offline Behavior

- Existing saved puzzles, starter puzzles, painting, settings, and gallery work offline.
- Search appears disabled when offline.
- The app shell should load offline after first successful install/cache.
- Offline error states should be calm and explicit.

---

## 8. Current Milestone: M2 - Local Personal Sources

### 8.1 M2 Product Definition

M2 is complete when:

> A child can make a puzzle from a local photo or camera capture, resume it from a trustworthy gallery, and complete it offline.

### 8.2 M2 Ships

- Photo import happy path.
- Camera capture or graceful browser fallback.
- Conversion preview with sensible default difficulty.
- Hex-circle puzzle shape as a child-requested option.
- Optional fit/fill crop choice if it stays visually obvious.
- Saved gallery with thumbnails, starter pictures, progress, completion state, and no duplicate starter cards.
- Exact resume.
- Parent-gated picture management.
- Storage and failed-import recovery.
- Offline/search-disabled states on Home.

### 8.3 M2 Defers

- Search as a shippable child-facing feature.
- Super-high-resolution puzzle mode.
- Bulk import as a marquee feature.
- Export/share flows.
- Print as a primary child-facing feature.
- Advanced palette editing promotion.

---

## 9. Updated Roadmap

| Phase | Focus | Outcome |
| ----- | ----- | ------- |
| M1 | Core engine | Done: conversion, tap/drag painting, save/resume, difficulty, offline app shell foundations. |
| M2 | Local personal sources | Photo import, camera capture/fallback, gallery confidence, exact resume, storage recovery, offline clarity. |
| M3 | Painting confidence | Make tap, drag, bucket, fill-all, hint, undo, palette progress, and colour completion unmistakable in real child use. |
| M4 | Safe search beta | Parent-enabled, default-off, topic-first search with conservative filtering, attribution, and recorded-result regression tests. |
| M5 | Trust and polish | Accessibility pass, sound tuning, completion/source compare polish, settings language, install/offline readiness. |
| M6 | Family readiness | Structured kid sessions, friction list, final v1 scope cuts, and release candidate hardening. |

---

## 10. Success Metrics

Because this is a personal-use app with no telemetry, success is observed directly.

- A child creates a local-photo or camera puzzle and starts painting in under 60 seconds after the first session.
- A child completes at least one personally meaningful picture without adult help.
- Kids return voluntarily to continue unfinished pictures.
- Kids can explain what the selected number/colour means without adult prompting.
- Parents report no surprise network use and no concern about local photo handling.
- Search, when enabled, produces no parent complaints about inappropriate results during family testing.
- The app works reliably on a trip with no internet after initial install/cache.

---

## 11. Testing and Development

### 11.1 Automated Testing

- Engine logic: Vitest unit tests.
- Painting state: model tests independent of DOM.
- Persistence: IndexedDB/fake-indexeddb tests for encoding, decoding, save, delete, and migrations.
- Router guards: route tests for search/offline/staged import protection.
- Search safety: blocked query and recorded-result fixture tests.
- UI contracts: focused jsdom tests for critical view behavior and accessibility hooks.

### 11.2 Manual and Device Testing

- Test photo import and camera capture on the target iPad/browser, not only desktop.
- Test installed PWA/offline behavior after first load.
- Test storage pressure by filling IndexedDB or simulating quota failures.
- Test gesture feel on real touch hardware for drag paint, pinch zoom, and palette scrolling.

### 11.3 Kid-Testing Protocol

- At the end of each milestone, hand the tablet to a target child with no instructions beyond "have a go."
- Watch silently for the first five minutes.
- Record:
  - where they hesitate
  - what they tap by mistake
  - what they ignore
  - what they ask out loud
  - where they smile
- Convert findings into a short ranked friction list before adding more features.

---

## 12. Open Questions

- Does the difficulty preview currently help children choose, or does it slow them down?
- Should fit/fill be child-facing, parent-facing, or hidden behind a simple crop preview?
- Is multi-photo import useful, or does it create too much queue confusion for the child?
- How should search be framed so parents understand it is filtered but not guaranteed?
- Which source images reliably create satisfying easy puzzles: pets, drawings, toys, faces, or starter art?
- Do kids discover bucket/fill-all naturally, or should the mascot coach introduce tools progressively?

---

## 13. Backlog

### Near-Term Backlog

- Run the target tablet capture log for Photos, Camera, cancellation, large images, installed PWA, and offline reload.
- Watch whether children understand MORE, FILL/FIT, and HEX CIRCLE during the first M2 kid sessions.
- Add friendlier storage-nearly-full guidance using browser storage estimates if useful.
- Add a short post-M2 kid test script and friction template.

### Deferred Until After M2

- Safe search as a shippable child-facing feature.
- Search topic curation beyond the starter set.
- Print-sheet polish and parent-facing print flow.
- Palette editing discovery and reset affordances.
- More starter images/theme packs.

### Future Iterations

- Export finished pixel art as PNG.
- Share to platform share sheet where supported.
- Printable paper activity packs.
- Switch Control and broader assistive-control support.
- iPhone/small-screen variant.
- Native iOS app revival if the PWA proves the product loop.

### Explicitly Parked

- 100x100+ or 500x500 puzzle creation.
- AI-generated imagery.
- Accounts/cloud sync/social features.
- Any monetisation.
