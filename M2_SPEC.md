# Tappy Colour - M2 Local Personal Sources Handoff

Version 0.1 | May 2026 | Web PWA implementation scope

---

## 1. Product Definition

M2 is complete when:

> A child can make a puzzle from a local photo or camera capture, resume it from a trustworthy gallery, and complete it offline.

This milestone is not about adding every available source or tool. It is about making the first personal-picture loop reliable, understandable, and safe enough for family use.

---

## 2. Scope

### Ships in M2

- Photo import from the browser image picker.
- Camera capture using capture-enabled file input where supported, with file-picker fallback.
- Conversion preview with easy default difficulty and simple visual preview.
- Fit/fill framing if it stays visually obvious and does not slow the child down.
- Hex-circle puzzle shape, because it is a specific child-user request. It should remain secondary to starting the puzzle and must stay understandable.
- Saved gallery with starter pictures, imported/camera pictures, thumbnails, progress, completion state, and no duplicate starter cards.
- Exact resume for grid, palette, selected colour, selected tool, and completion state.
- Parent-gated picture management for deletion.
- Durable child profile persistence for mascot, search access, adult gate, sound, auto-fill, and default difficulty.
- Storage-quota and failed-import recovery messaging.
- Offline clarity: local features work offline, search is visibly unavailable offline.

### Explicitly Deferred

- Search as a shippable child-facing source.
- Super-high-resolution puzzle mode above 80x80.
- Bulk import as a headline feature.
- Export/share flows.
- Print as a primary child-facing flow.
- Advanced palette editing education.

---

## 3. Primary User Flow

1. Child lands on Home.
2. Child chooses Photos or Camera.
3. Browser picker/camera returns an image, or cancellation returns cleanly to Home.
4. App stages the image locally and opens the conversion preview.
5. Child accepts the default difficulty or adjusts it.
6. App converts locally in the worker and stores the puzzle in IndexedDB.
7. Child paints enough to understand the loop.
8. Child leaves and returns later.
9. Gallery opens the same puzzle exactly where it was left.
10. Child completes the puzzle and can admire the finished painting.

---

## 4. Acceptance Criteria

### Local Import and Camera

- Photo import accepts image files only.
- Multiple selected photos do not break the flow; either queue clearly or process one-at-a-time.
- Camera capture uses `capture="environment"` where supported.
- Camera fallback is acceptable where the browser does not expose direct capture.
- Cancelling the picker/camera does not show an error toast.
- Non-image and too-large images show a friendly, actionable error.
- Imported images are decoded locally and downscaled before conversion.

### Conversion Preview

- Default difficulty comes from parent settings and starts easy by default.
- Preview makes the output feel predictable enough for the child to start.
- Any visible extra control must have a clear child-facing purpose.
- Hex-circle remains available as a child-requested shape option.
- High-resolution controls are absent from the default M2 path unless deliberately hidden behind an internal flag.

### Gallery and Resume

- Gallery waits for the initial IndexedDB load before starter cards can create duplicates.
- Saved bundled starter art replaces its starter card.
- Imported/camera puzzles show a thumbnail.
- Cards show progress or completed state.
- Opening a saved puzzle restores:
  - painted cells
  - palette edits
  - selected colour
  - selected tool
  - completion state
  - source image when available

### Parent Trust

- The child's profile settings survive app updates through IndexedDB-backed durable profile storage.
- Search remains off by default.
- Direct `#/search` navigation respects parent setting and online state.
- Home explains search-disabled/offline state visibly.
- Child gallery has no one-tap destructive controls.
- Parent settings can delete selected pictures and all pictures with strong confirmation.
- Storage failures surface visible recovery guidance.

### Offline

- After the app shell is cached, Home, gallery, existing puzzles, starter images, settings, and local painting work offline.
- Search is disabled offline and does not attempt Openverse requests.
- Service worker does not persist third-party search API/image responses.

---

## 5. Implementation Tickets

### P1 - Make the M2 happy path unmistakable

- Audit Home -> Photos -> Difficulty -> Puzzle on target tablet browser.
- Audit Home -> Camera -> Difficulty -> Puzzle on target tablet browser.
- Record actual iPad Safari behavior for capture-enabled input.
- Fix any broken cancellation, fallback, or routing states.

### P1 - Simplify conversion preview for children

- Keep `HEX CIRCLE` available and verify that children understand it as a shape choice.
- Keep `FILL/FIT` only if the preview makes the difference obvious.
- Ensure default slider, preview cards, stats, and start action all agree.
- Keep all controls at least 44px and readable on portrait tablet widths.

### P1 - Improve visible search-disabled states

- Replace title-only disabled Search explanations with visible Home text or badge.
- Distinguish "parent off" from "needs internet."
- Keep direct route guard behavior.

### P1 - Storage recovery polish

- Ensure quota errors from conversion save and progress save reach visible UI.
- Point recovery to parent picture manager.
- Consider a storage estimate warning only if browser support is reliable enough.

### P2 - Import queue guardrails

- If multiple photos are selected, show queue count or next-photo progress.
- Avoid surprise conversion of many images without the child knowing.
- Clear queued images when the child backs out.

### P2 - M2 device/offline test script

- Add a short manual QA checklist for iPad Safari/PWA.
- Include offline app-shell, local import, camera fallback, resume, and storage cases.

### P3 - Post-M2 kid-test template

- Add a one-page observation template for the first local-source kid test.
- Capture hesitations, mistaken taps, ignored controls, spoken questions, and delight moments.

---

## 6. Out-of-Scope Notes

Search scaffolding may continue to exist in the codebase, but it should not pull M2 scope toward network quality, provider choice, or broad safety claims.

Print sheets and source-photo compare can remain as implemented utility affordances, but they should not drive M2 acceptance. The child should be able to succeed without discovering them.

High-resolution experiments should stay parked until the standard 16x16-80x80 loop is validated with real child use. Hex-circle is no longer parked because it is a child-requested shape option; keep it simple and test it in the normal conversion flow.
