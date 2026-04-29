# Tappy Colour Backlog

Source: project code review on 2026-04-25.

## New review items from 2026-04-28

## P1

### Search should convert the selected source image, not the thumbnail

- Status: Done
- Area: `web/src/views/SearchScreen.ts`, `web/src/model/ImportStaging.ts`, artwork attribution/source storage
- Issue: Search selection currently fetches `result.thumbnail` for the actual puzzle bitmap while attribution points at the source/landing URL.
- Issue: Searched puzzles and the completed PHOTO comparison can therefore be based on a low-resolution or cropped proxy rather than the licensed image the child chose.
- Outcome: Search conversion prefers the selected full image URL with type/size/CORS guards, falls back to the thumbnail only when needed, and records which image asset was actually used.
- Completed: Search selection now prefers the Openverse direct image URL with HTTP/image/size/fetch guards, falls back to the thumbnail, stages the actual selected blob for conversion/source storage, and records the used image URL/kind in search attribution.

### Imported image retry can reuse a transferred bitmap

- Status: Done
- Area: `web/src/views/DifficultyPicker.ts`, `web/src/model/ImportStaging.ts`, `web/src/engine/ImageConverter.ts`
- Issue: Staged camera/library/search images transfer their `ImageBitmap` to the conversion worker before `this.staged` is cleared.
- Issue: If worker conversion fails, START is re-enabled but the staged bitmap may already be detached/transferred, so retry can fail or behave unpredictably.
- Outcome: Staging keeps an original `Blob`/`File` or another recreateable source, and each conversion attempt creates a fresh `ImageBitmap` before transfer.
- Completed: Staged imports now keep the original image blob and retain a preview bitmap separately; each START attempt decodes a fresh bitmap from the blob before worker transfer, with a regression covering worker failure followed by retry.

## P2

### Print sheet window should not keep opener access

- Status: Done
- Area: `web/src/util/printSheet.ts`
- Issue: The print sheet opens a same-origin tab without nulling `opener`.
- Issue: The current generated HTML escapes the title, so risk is low today, but future printable metadata could widen the tabnabbing/opener surface.
- Outcome: The print flow either sets `printWindow.opener = null` immediately after open or prints through a sandboxed/hidden iframe.
- Completed: `printArtworkSheet` now nulls `opener` before writing printable HTML, with a jsdom regression asserting the print window cannot retain opener access.

### Conversion worker errors can leak pending requests

- Status: Done
- Area: `web/src/engine/ImageConverter.ts`, `web/src/workers/conversion.worker.ts`
- Issue: Each worker conversion adds a one-shot error listener, but the error path does not remove the call from `pendingWorkerCalls`, terminate/recreate the worker, or reject only the affected request.
- Issue: A worker-level error can leave stale pending handlers and make later conversions unreliable.
- Outcome: Worker error handling is centralized so worker failures reject and clear all pending calls, reset the worker, and are covered by regression tests.
- Completed: ImageConverter now uses one worker-level error handler that prevents default error handling, rejects and clears pending calls, terminates the failed worker, and creates a fresh worker for the next conversion; per-request worker error messages still reject only their own request.

## P3

### Difficulty picker needs responsive narrow-width layout

- Status: Done
- Area: `web/src/views/DifficultyPicker.ts`, `web/src/styles/global.css`, view tests/screenshots
- Issue: The difficulty screen hard-codes two columns and the preview area hard-codes three cards across.
- Issue: On narrow portrait/mobile-like viewports this can squeeze controls and preview text, which cuts against kid-readable UI and 44pt touch-target goals.
- Outcome: DifficultyPicker stacks preview and controls at narrow widths, reduces preview cards to one or two columns as needed, and has responsive regression coverage.
- Completed: DifficultyPicker layout now uses responsive CSS classes, stacks to one column at narrow widths, steps preview cards from three to two to one column, stretches the start control on mobile, and has regression coverage for the layout hooks and breakpoints.

## New review items from 2026-04-27

## P1

### Search safety filter is too shallow

- Status: Done
- Area: `web/src/util/searchSafety.ts`, `web/src/views/SearchScreen.ts`
- Issue: Search results are accepted when the query passes a small block list and the result title/tags do not contain blocked words.
- Issue: The current client-side filter does not inspect broader result metadata or handle unsafe-but-untagged images robustly enough for the PRD's parent-trust promise.
- Outcome: Search uses stronger result filtering, with regression tests built from recorded safe, borderline, and blocked responses before M4 search is treated as shippable.
- Completed: Search filtering now checks broader Openverse metadata, provider sensitivity flags, usable image URLs, and vague untagged results, with safe/borderline/blocked regression fixtures.

## P2

### Undo after completion can still show completion UI

- Status: Done
- Area: `web/src/model/PaintingSession.ts`, `web/src/views/PuzzleContainer.ts`, `web/src/views/CompletionOverlay.ts`
- Issue: Completing the final cell schedules the number fade and completion overlay, but undo only flips `isComplete` and `numbersVisible`.
- Issue: A quick undo after the final paint can leave an incomplete puzzle with hidden numbers or a celebration overlay still appearing.
- Outcome: Undoing completion clears pending completion timers, restores number visibility, persists the incomplete state, and dismisses any completion overlay.
- Completed: Undo now clears the completion fade timer, restores number visibility, emits completion state changes, persists the incomplete puzzle, and dismisses the completion overlay.

### Auto-fill setting has no gameplay effect

- Status: Done
- Area: `web/src/views/SettingsScreen.ts`, conversion pipeline, persistence model
- Issue: Settings exposes `autoFillEnabled`, but conversion and painting do not read it.
- Issue: Parents can toggle a PRD-required setting that does not change newly converted puzzles.
- Outcome: Background or near-uniform areas are optionally pre-filled during conversion, defaulting on, and the setting is covered by tests.
- Completed: Conversion settings now persist `autoFillEnabled`, new puzzles read the parent setting, and enabled conversion pre-paints conservative border-connected background regions with regression coverage.

### In-route redirects can blank the app

- Status: Done
- Area: `web/src/router.ts`
- Issue: `route()` ignores nested route calls while `isRouting` is true, but some branches navigate or recurse after clearing the root.
- Issue: A hard reload on `#/difficulty/import` with no staged image can navigate home during routing, ignore the hashchange, and leave no mounted home view.
- Outcome: Router redirects are handled in one pass without dropping the final route, including regression coverage for guarded routes.
- Completed: Router redirects now resolve before mounting, route calls during async routing are replayed, and the missing staged import path renders Home in the same pass.

### Gallery can briefly offer duplicate starter puzzles

- Status: Done
- Area: `web/src/views/HomeScreen.ts`, `web/src/model/ArtworkStore.ts`
- Issue: Home renders before `fetchAll()` completes, then derives saved and starter cards directly from the store cache.
- Issue: On launch, a child can tap a bundled starter before IndexedDB loads the saved version, creating a duplicate instead of resuming progress.
- Outcome: Home waits for the initial gallery load, or renders a safe loading state, before starter cards can be opened.
- Completed: Home now shows a gallery loading state until the initial `fetchAll()` finishes, then renders saved/starter cards from the loaded cache with regression coverage for saved bundled pieces.

### Selected colour should be highlighted more clearly

- Status: Done
- Area: `web/src/views/PaletteStrip.ts`, `web/src/views/GridCanvas.ts`
- Issue: The selected palette colour needs a stronger, kid-readable visual state in both the palette and the puzzle grid.
- Outcome: The active number/colour is unmistakable, with accessible contrast and a treatment that remains clear while zoomed or scrolling the palette.
- Completed: Palette entries now use a high-contrast selected frame and number badge, and unpainted cells for the selected colour render with a tint, heavier outline, and darker number label.

### Add mascot-aligned encouragement after each colour is complete

- Status: Done
- Area: `web/src/model/PaintingSession.ts`, `web/src/views/PuzzleContainer.ts`, mascot assets/copy
- Issue: Colour completion is mechanically useful but currently misses a delight moment.
- Outcome: Completing a colour triggers a short, cute, mascot-aligned encouragement moment, respecting sound and reduced-motion settings.
- Completed: Painting sessions now emit `colourCompleted`, and Puzzle shows a short mascot-specific encouragement toast with the existing colour-complete sound and reduced-motion handling.

### Add a hint option for the selected colour

- Status: Done
- Area: `web/src/views/ToolbarStrip.ts`, `web/src/views/GridCanvas.ts`, `web/src/model/PaintingSession.ts`
- Issue: The PRD lists an optional hint mechanic, but the app does not yet expose one.
- Outcome: A hint control briefly highlights the remaining cells or numbers for the selected colour, then fades without auto-painting.
- Completed: Toolbar now has a hint control that emits a non-painting `hintRequested` event, and GridCanvas briefly overlays the remaining selected-colour cells before fading the hint away.

### Scale square number labels for dense grids

- Status: Done
- Area: `web/src/views/GridCanvas.ts`
- Issue: High-density puzzles can become an unreadable mash of numbers when zoomed out.
- Outcome: Number labels scale or hide gracefully based on effective cell size, becoming readable again when the child zooms in.
- Completed: GridCanvas now hides labels below a readable effective cell size and scales visible labels with a capped font size, with canvas regressions for dense and readable grids.

### Completed puzzle should hide grid lines

- Status: Done
- Area: `web/src/views/GridCanvas.ts`, `web/src/model/PaintingSession.ts`
- Issue: Completed artwork still reads as a grid rather than clean pixel art.
- Outcome: Once the puzzle is complete, grid lines disappear and only the painted colours remain, while in-progress puzzles still show helpful cell boundaries.
- Completed: GridCanvas now rerenders on completion changes and suppresses cell boundary strokes once a puzzle is complete, with regressions for in-progress and completed canvases.

### Completed puzzle can toggle between painting and source image

- Status: Done
- Area: artwork persistence, thumbnails/source storage, completion/gallery view
- Issue: The "wow" moment would be stronger if a child could compare the finished pixel art with the original image.
- Outcome: Completed pieces provide a simple toggle between the completed painting and the actual source image, while preserving privacy and offline access.
- Completed: Imported, camera, and search puzzles now persist an offline source-image copy; completed puzzles expose a PHOTO/PAINT toggle in the puzzle view, and the completion overlay can be dismissed to keep looking.

## Future feature opportunities

### Smart difficulty preview

- Status: Done
- Source: Feature opportunity 2 from 2026-04-27 review
- Idea: Show the same image at easy, medium, and hard pixel-grid previews before conversion, with estimated completion time and a clear warning when cells become tiny.
- Product value: Helps kids self-pace and helps parents avoid accidentally creating frustrating puzzles.
- Completed: DifficultyPicker now shows easy, medium, and hard pixel previews with estimated time and a tiny-cell warning, and tapping a preview updates the actual slider.

### Printable colour-by-number sheet

- Status: Done
- Source: Feature opportunity 6 from 2026-04-27 review
- Idea: Let a finished or unstarted puzzle become a printable paper activity.
- Product value: Extends the offline family-use proposition beyond the screen and supports trips, quiet time, and craft play.
- Completed: Untouched and completed puzzles now show a PRINT action that generates an offline printable numbered grid with a palette legend.

### Super-high-resolution puzzle mode

- Status: Done
- Idea: Explore very high pixel counts such as 100x100 or 500x500 for older kids or finished-art quality.
- Product value: Numbers would only appear after pinch zooming in, but the completed artwork could preserve far more image detail.
- Risk: Needs careful performance, storage, touch-target, and rendering work before it fits the 60fps/offline constraints.
- Completed: Exploration documented in `web/docs/super-high-resolution-mode.md`; recommendation is to avoid shipping above 80x80 until cached rendering, viewport culling, profiling, and parent/older-kid gating are in place.

## P1

### Service worker cannot reliably install or serve offline app shell

- Status: Done
- Area: `web/public/service-worker.js`
- Issue: The precache list includes `./sounds/completion.mp3` and `./sounds/tap.mp3`, but those files do not exist under `public/` or `dist/`, so `cache.addAll` rejects and the service worker install fails.
- Issue: The hand-written precache list omits Vite's hashed JS/CSS assets under `dist/assets`, so offline-first launch is not reliable even after the missing sound entries are fixed.
- Outcome: The production app shell and all required same-origin assets install reliably for offline use.
- Completed: Build now injects a generated precache manifest from `dist/`, including Vite hashed assets and excluding missing/manual entries.

### Search route bypasses the parental/offline gate

- Status: Done
- Area: `web/src/router.ts`
- Issue: Home disables the search button based on `UserSettings.searchEnabled` and `navigator.onLine`, but direct navigation to `#/search` still mounts `SearchScreen`.
- Outcome: Direct route access respects both the parental search setting and current online state before any Openverse request can be made.
- Completed: Search access is now shared between Home and the router, so disabled/offline direct navigation returns to Home before `SearchScreen` can mount.

### Backgrounding can drop the latest paint action

- Status: Done
- Area: `web/src/model/ArtworkStore.ts`
- Issue: `save()` debounces writes for 150ms, but the `visibilitychange` and `pagehide` handler only clears timers without writing pending snapshots.
- Outcome: Any pending artwork save is flushed, or save semantics change, so progress is preserved when the app is backgrounded immediately after painting.
- Completed: Debounced saves now retain pending artwork snapshots and flush them on page hide/visibility changes before timers can drop progress.

## P2

### Adjacent out-of-bounds coordinates wrap into real cells

- Status: Done
- Area: `web/src/engine/PixelGrid.ts`
- Issue: `paint()`, `unpaintCells()`, and `cell()` validate only the flattened index. Coordinates like `(columns, 0)` or `(-1, 1)` can read or mutate an in-range but incorrect cell.
- Outcome: Grid APIs validate `col` and `row` independently before deriving a flat index, with regression tests for adjacent out-of-bounds coordinates.
- Completed: PixelGrid now validates coordinates before flattening, with regressions covering paint, unpaint, and read operations.

### Bucket fill cannot fill colour number 1

- Status: Done
- Area: `web/src/engine/floodFill.ts`
- Issue: Palette index `0` is the first real palette colour shown as number 1, but `floodFillRegion` treats `paletteIndex === 0` as background and returns no cells.
- Outcome: Bucket fill works for every palette index, including index 0, unless a separate explicit background concept is introduced.
- Completed: Flood fill no longer treats palette index 0 as background, with regression coverage for the first palette colour.

### Required settings are missing

- Status: Done
- Area: `web/src/views/SettingsScreen.ts`, `web/src/model/UserSettings.ts`
- Issue: The settings screen exposes sound, default difficulty, parent code, and clear-all only.
- Issue: The PRD requires parent controls for enabling/disabling internet search and background auto-fill.
- Issue: `searchEnabled` defaults to false, so the home tile can say search is off in settings even though there is no UI to turn it on.
- Outcome: Settings include internet search and background auto-fill controls, and Home reflects those settings accurately.
- Completed: Settings exposes and wires internet search and auto-fill toggles, with tests covering the controls and Home's search availability state.

### Resume does not preserve tool or selection state

- Status: Done
- Area: `web/src/model/PaintingSession.ts`, persistence model
- Issue: A resumed session always starts with `currentTool = 'tap'` and recomputes `selectedPaletteIndex` from the first incomplete colour.
- Outcome: Resume restores the last selected tool and palette colour as part of the saved artwork/session state.
- Completed: Artwork persistence now includes session tool and selected palette state, and session tool/palette changes save that state for exact resume.

### Palette selection can target nested elements

- Status: Done
- Area: `web/src/views/PaletteStrip.ts`
- Issue: `querySelectorAll('div > div')` matches swatches, number labels, progress labels, and other nested divs, not just palette entries.
- Outcome: Palette entry elements have stable selectors or references so selection rings, pulse animation, and auto-scroll target the intended entry.
- Completed: Palette entries and swatches now use stable data selectors, so selection, pulse, and auto-scroll target only palette entries.

### Colour picker backdrop cancel leaves the modal mounted

- Status: Done
- Area: `web/src/views/ColourPicker.ts`, `web/src/views/PaletteStrip.ts`
- Issue: Clicking the backdrop calls `opts.onCancel()` but does not unmount the overlay. `PaletteStrip` clears `activePicker`, leaving the modal stuck in the DOM with no owner reference.
- Outcome: Backdrop cancel unmounts the colour picker and clears owner state consistently.
- Completed: Colour picker backdrop cancellation now shares the same self-unmounting cancel path as the cancel button, with PaletteStrip regression coverage for stuck overlays.

### Service worker caches search traffic indefinitely

- Status: Done
- Area: `web/public/service-worker.js`
- Issue: The fetch handler caches every successful request, including Openverse API URLs and image thumbnails.
- Outcome: Runtime caching is restricted to appropriate same-origin app assets and does not retain search queries or third-party search results.
- Completed: Runtime cache writes are limited to same-origin GET responses, so Openverse/API/image-search traffic is not retained.

### Dev server advisory is amplified by LAN exposure

- Status: Done
- Area: `web/vite.config.ts`, `web/package-lock.json`
- Issue: `npm audit` reports a moderate Vite/esbuild dev-server advisory, and `server.host = true` exposes the dev server beyond localhost.
- Outcome: Development server exposure is reduced to localhost by default, or the Vite/esbuild chain is upgraded after validating compatibility.
- Completed: Vite dev server now binds to `127.0.0.1` by default instead of all LAN interfaces.

## P3

### Difficulty slider thumb does not match actual setting

- Status: Done
- Area: `web/src/views/DifficultyPicker.ts`
- Issue: The input value is hard-coded to `50`, while conversion uses `UserSettings.defaultSliderValue`.
- Outcome: The visible slider thumb, chick row, size label, and conversion setting all start from the same value.
- Completed: Difficulty picker behavior is covered by a regression asserting the slider, chick row, and stats initialize from `UserSettings.defaultSliderValue`.

### Individual delete is only one confirmation

- Status: Done
- Area: `web/src/views/HomeScreen.ts`
- Issue: The PRD says delete requires two-step confirmation. Clear-all has two confirmations, but deleting one artwork has only one dialog.
- Outcome: Individual artwork deletion uses a two-step confirmation or the PRD is updated if one-step deletion is intentional.
- Completed: Individual artwork deletion now requires two confirm dialogs before removing the saved artwork, with HomeScreen regression coverage.
