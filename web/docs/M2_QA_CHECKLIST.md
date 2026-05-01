# M2 QA Checklist - Local Personal Sources

Use this checklist before calling M2 shippable. Run it on the target iPad/tablet browser as well as desktop development browsers.

## Setup

- Build from `web/` with `npm run build`.
- Serve a production build with `npm run preview` or the deployed GitHub Pages build.
- Clear existing app data once, then repeat key checks with existing saved data.
- Test both online and offline after the app shell has loaded once.

## Home and Gallery

- Home loads without a blank state.
- Starter pictures are visible after gallery load.
- Saved bundled starter pictures do not appear twice.
- Imported/camera pictures show thumbnails.
- Saved cards show progress or DONE state.
- Child gallery does not expose delete controls.
- Settings opens behind the adult check.
- Parent picture manager can delete selected pictures only after strong confirmation.

## Photo Import

- Tapping PHOTOS opens an image picker.
- Cancelling the picker returns quietly to Home.
- Selecting one valid image opens the conversion preview.
- Selecting multiple images does not confuse the flow; queued state is clear or safely one-at-a-time.
- A non-image file is rejected with friendly messaging where the browser allows selecting it.
- Very large images are rejected or downscaled without freezing the app.
- Imported picture converts locally and opens as a puzzle.

## Camera

- Tapping CAMERA opens camera capture on supported target browsers.
- Unsupported browsers fall back to file picker without breaking the flow.
- Cancelling capture returns quietly to Home.
- Captured image opens the conversion preview.
- Captured image is not uploaded and is not saved outside the app by Tappy Colour.

## Conversion Preview

- Default difficulty starts from parent setting.
- The child can start with the default without understanding every control.
- Preview image is recognisable enough to avoid surprise.
- Fit/fill choice, if visible, is understandable from the preview.
- Experimental shape/high-resolution controls are absent from the default M2 path.
- Conversion failure leaves the child with a clear recovery path.

## Painting and Resume

- Tap paints correct cells.
- Drag paints matching cells smoothly.
- Bucket and fill-all work as one undo step.
- Wrong-number taps give gentle feedback and do not change state.
- Hint highlights remaining selected-colour cells.
- Closing/backgrounding shortly after painting preserves progress.
- Resume restores selected colour, selected tool, palette edits, and painted cells.
- Completion hides numbers/grid lines and shows celebration.
- Completed imported/camera puzzles can compare painting with source image when available.

## Offline

- Load the app once online, then turn off network.
- Home still opens.
- Existing saved puzzles still open.
- Starter puzzles still open/convert.
- Painting and saving continue to work.
- Settings opens.
- Search is visibly unavailable and does not attempt a request.

## Storage Pressure

- Simulate or force IndexedDB quota failure if practical.
- Conversion save failure shows a visible message.
- Progress save failure shows a visible message.
- Recovery points parents to picture management.
- The current in-memory puzzle remains usable where practical.

## Parent Trust

- Search is off by default.
- Direct `#/search` navigation redirects when search is disabled.
- Direct `#/search` navigation redirects while offline.
- Search attribution remains available for search-sourced puzzles when search is enabled for testing.
- No photo source is uploaded during local import/camera conversion.

