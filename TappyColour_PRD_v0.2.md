# Tappy Colour — PRD v0.2

**Product Requirements Document**

**Tappy Colour**

*A colour-by-numbers app for kids, built for offline iPad play*

Version 0.2  |  Draft  |  April 2026

---

## Change Log

**v0.2** — Renamed to Tappy Colour. Difficulty progression made free-flowing rather than tiered. Added fill-by-number, bucket fill, suggested palettes, and palette editing. Export/share moved to backlog. Added Testing & Development section.

**v0.1** — Initial draft.

---

## 1. Overview

Tappy Colour is an offline-first iPad app that turns any photo — from the camera roll, a fresh snap, or a safe web search — into a colour-by-numbers pixel art puzzle. Kids colour the grid square by square, following a numbered palette, and end up with a pixel art version of their original image that they can save, revisit, and admire.

The app is designed for personal, ad-free use on family iPads. The core colouring experience works without an internet connection. Internet is required only for the safe image-search feature.

---

## 2. Goals and Non-Goals

### 2.1 Goals

- **Delight first.** Every interaction should feel satisfying — tapping a square, completing a colour, finishing a picture.
- **Offline by default.** The colouring loop, photo library, camera, save/resume, and palette tools all work in airplane mode.
- **Age-appropriate for 6–10.** Readable UI, minimal text, large touch targets, forgiving interactions.
- **Self-paced progression.** Kids choose their own difficulty and decide when they're ready for harder pictures.
- **Safe content sourcing.** When the internet is used, it is used narrowly and safely, with clear parental control.
- **Personal artwork.** The "wow" moment is seeing a photo you care about become a piece of pixel art.

### 2.2 Non-Goals (for v1)

- Social features, accounts, cloud sync, or leaderboards.
- Monetisation — no ads, no in-app purchases, no subscriptions.
- iPhone, Android, or web versions.
- AI-generated imagery from speech or text prompts.
- Multiplayer or collaborative colouring.
- Export and sharing of finished pixel art (see Section 11: Backlog).

---

## 3. Target User

### 3.1 Primary user: the child

- **Age:** 6–10 years old.
- **Reading level:** Developing; prefers icons and numbers over long labels.
- **Motor skills:** Comfortable with taps and drags; less precise than adults, so targets and gestures must be forgiving.
- **Context of use:** On a family iPad, often without active adult supervision, frequently offline (car trips, flights, quiet time).
- **Motivation:** The fun of colouring, the satisfaction of completion, and pride in seeing their own photos transformed.

### 3.2 Secondary user: the parent

Parents set the iPad up, may help onboard their child the first time, and care deeply that the app is safe, offline-capable, and doesn't nickel-and-dime them. They are not active users day-to-day but are the gatekeeper for whether the app stays on the device.

---

## 4. Key User Stories

- **As a child,** I want to pick a photo from the iPad and turn it into a colour-by-numbers puzzle.
- **As a child,** I want to take a photo of my pet or my drawing and colour that, so the art feels like mine.
- **As a child,** I want to search for a picture of a dinosaur or a unicorn and colour it in.
- **As a child,** I want to tap one square at a time, or drag across many squares with the same number.
- **As a child,** I want to tap once and have all the squares of one number filled in.
- **As a child,** I want to tap once on a connected area and have it all filled in (bucket fill).
- **As a child,** I want to use the colours the app suggests, but also be able to swap them for ones I like better.
- **As a child,** I want to stop colouring and come back later to finish, without losing my progress.
- **As a child,** I want easier pictures when I'm starting out and harder, more detailed ones when I've got the hang of it — and I want to be the one who decides.
- **As a parent,** I want to know my child can't accidentally see inappropriate images when they search.
- **As a parent,** I want the app to work on a plane or in the car with no internet.

---

## 5. Functional Requirements

### 5.1 Image sourcing

#### 5.1.1 Photo library import

- Use Apple's PhotoKit with limited library access so the child only sees photos the parent has chosen to expose.
- Present photos in a large, scrollable grid with generous thumbnails.
- No metadata (dates, locations, albums) shown to the child.
- Works offline.

#### 5.1.2 Camera capture

- One-tap entry to the camera from the home screen.
- Use the iPad's native camera interface via AVFoundation; no custom filters or effects in v1.
- After capture, the photo goes straight into the conversion preview — it is not saved to the camera roll unless the child explicitly chooses to.
- Works offline.

#### 5.1.3 Safe internet image search

- Search is restricted to images licensed for free use (Creative Commons, public domain) via a curated provider such as Openverse, Wikimedia Commons, or the Pixabay API.
- All queries are filtered through a kid-safe keyword allow/block list before being sent.
- SafeSearch (or equivalent) is always on and cannot be disabled from inside the app.
- Results are additionally filtered client-side against a block list of categories (weapons, violence, suggestive content, etc.).
- Attribution for the source image is stored with the artwork (even if not displayed to the child) so copyright compliance is preserved.
- Requires internet. Disableable via parental settings.

### 5.2 Image-to-grid conversion

- The child chooses a difficulty by adjusting a slider (see 5.2.1).
- The source image is resized, then quantised to a limited palette.
- Each palette colour is assigned a number (1, 2, 3…).
- Background/near-uniform areas can optionally be pre-filled to reduce tedium (toggleable in settings, default on).
- Conversion happens entirely on-device. No image ever leaves the device for conversion.
- Conversion should complete in under 3 seconds at the default difficulty on a 6th-gen iPad or newer.

#### 5.2.1 Free-flowing difficulty

Difficulty is a continuous slider rather than fixed tiers, so kids can self-pace from "first ever puzzle" to "I want a real challenge" without hitting an artificial wall.

| Slider position | Grid size         | Palette size       | Rough time   |
| --------------- | ----------------- | ------------------ | ------------ |
| Easiest         | 16 × 16           | Up to 6 colours    | 5 minutes    |
| Mid-range       | smoothly scaling… | smoothly scaling…  | …            |
| Hardest         | 80 × 80           | Up to 24 colours   | 90+ minutes  |

- **Engineering cost.** Increasing the difficulty range costs almost nothing. The conversion pipeline already takes grid size and palette size as parameters; whether the slider exposes 4 fixed values or a continuous range is a UI decision, not an engine decision. The saving comes from not having to build a meta-progression or "unlock" system at all.
- **Slider UX.** Visualised as a row of pixel-art chicks: one tiny chick on the easy end, a long row of chicks on the hard end. Reading-light, fun, and self-explanatory.
- **Default.** First-time users start at the easy end. After that, the slider remembers the last position used.

### 5.3 Suggested and editable palettes

When a picture is converted, the app proposes a starting palette derived from the source image, then lets the child swap any colour for one they like better.

#### 5.3.1 Suggested palette

- After conversion, palette colours are quantised directly from the dominant colours of the source image (e.g., median-cut or k-means clustering).
- The suggested palette is what the child sees on first opening the puzzle. It is the default and they can simply ignore palette editing entirely.
- The suggested palette aims for a result that visibly resembles the original photo when complete.

#### 5.3.2 Editing the palette

- Tapping and holding any colour swatch in the palette opens a colour-picker.
- The picker offers a curated grid of kid-friendly colours (bright, distinct, colourblind-considerate) plus a free-form HSB picker for older kids who want fine control.
- Changing a palette colour live-updates every square painted with that number (and the swatch). Already-painted squares immediately show the new colour.
- "Reset palette" button restores the originally suggested palette.
- Palette changes are part of the auto-save state, so they persist across sessions.

### 5.4 Colouring experience

#### 5.4.1 Painting tools

Four painting modes are available, switchable from a small toolbar near the palette:

- **Tap.** Single tap fills one square with the currently selected number's colour. Wrong-number taps are gently rejected (small shake animation).
- **Drag.** Pressing and dragging across squares paints every correct square of the currently selected number in a single gesture. Wrong-number squares are skipped automatically.
- **Bucket.** Single tap on a connected region of squares with the currently selected number fills the whole connected region at once. Region detection uses 4-connectivity (orthogonal neighbours only) to keep behaviour predictable.
- **Fill-all-of-number.** Single tap anywhere fills every remaining square of the currently selected number across the whole image.

#### 5.4.2 Tool behaviour notes

- Tap is the default mode and the one kids start in.
- All four modes are always available with no gating — kids can use them as much as they like.
- Modes are visually distinct (different icons, brief animation when switched) so kids understand what's about to happen.
- Each mode action is a single undo step.

#### 5.4.3 Other gameplay elements

- **Colour palette.** All numbered colours are visible in a scrollable palette strip. Each entry shows the number, the colour swatch, and a progress indicator (e.g., 12/40 filled).
- **Auto-advance.** When all squares of a colour are filled, the palette subtly highlights the next incomplete colour.
- **Zoom & pan.** Standard pinch-to-zoom and two-finger pan. Maximum zoom should make individual squares comfortably tap-sized for small fingers.
- **Undo.** A single-step undo button for the most recent action.
- **Hint (optional).** A subtle "where's the next square?" hint for the selected colour, on-demand.
- **Completion moment.** When the final square is filled, the numbers fade out, revealing the finished pixel art with a celebratory animation and sound.

### 5.5 Save and resume

- All artwork-in-progress is auto-saved to local device storage after every action.
- The home screen shows a "My Pictures" gallery with in-progress and completed pieces, each showing a thumbnail and a progress percentage.
- Tapping any piece resumes it exactly where the child left off, with palette edits and tool state preserved.
- Completed pieces can be viewed in their finished, number-free state at any time.
- Delete requires a two-step confirmation to prevent accidental loss.

### 5.6 Parental settings (PIN-gated)

- Enable/disable internet image search.
- Default difficulty slider position.
- Background auto-fill on/off.
- Sound effects on/off.
- Clear all saved artwork.
- The PIN is set on first launch and required to enter settings. The PIN prompt presents a simple arithmetic challenge (e.g., "What is 7 + 6?") as a lightweight adult gate — sufficient to keep curious 6-year-olds out without being a real security boundary.

---

## 6. Non-Functional Requirements

### 6.1 Platform

- iPadOS 16 and above.
- Universal iPad app — supports all iPad sizes from mini to 12.9" Pro.
- Portrait and landscape orientations both supported; colouring works best in landscape.

### 6.2 Performance

- Cold launch to home screen in under 2 seconds on supported devices.
- Image-to-grid conversion under 3 seconds at default difficulty.
- 60fps during painting, including drag-to-paint and bucket fill on an 80×80 grid.
- Palette-edit live updates apply within 100ms even when many squares are repainted.

### 6.3 Privacy and safety

- No user accounts. No personal data collected or transmitted.
- No analytics, no telemetry, no crash reporting that transmits off-device in v1.
- Photos never leave the device under any circumstance.
- Internet image search is the only network-using feature and is disableable by the parent.
- Complies with Apple's Kids Category guidelines and COPPA.

### 6.4 Accessibility

- Minimum touch target size of 44×44pt (Apple HIG) for all controls.
- Colour palette includes number labels so colour-blind children can still distinguish colours by number.
- The palette colour picker offers a colourblind-friendly preset row.
- Support Dynamic Type for any non-game text (menus, settings).
- VoiceOver labels for all interactive controls in settings.

### 6.5 Offline behaviour

- Every feature except internet image search must work offline.
- When offline, the search tile on the home screen is visibly greyed out rather than hidden, with a gentle "needs internet" label.

---

## 7. Testing and Development

This section answers the practical question: how is functionality tested while the app is being built?

### 7.1 Layered testing strategy

Different layers of the app are best tested in different ways. The strategy is to use the cheapest, fastest tool that gives genuine confidence at each layer.

| Layer | How it's tested | Why this approach |
| ----- | --------------- | ----------------- |
| Conversion engine (image → grid + palette) | Swift unit tests with a fixed library of input images and expected outputs. | Pure logic with deterministic inputs and outputs. Fast to run, easy to regression-test when tuning quantisation. |
| Painting logic (tap, drag, bucket, fill-by-number, undo) | Swift unit tests on the underlying state model, with separate UI tests on top. | Keep the data model unit-testable in isolation. Verifies that 1000 bucket-fills give the right state regardless of rendering. |
| UI and gestures | XCUITest in the iOS Simulator for happy-path flows; manual testing on real iPads for gesture feel. | Simulators can't honestly reproduce drag-paint precision, palm rejection, or finger-on-glass feedback. Real hardware is essential here. |
| Safety filters (search query and result filtering) | Unit tests with a curated list of test queries (kid-safe, borderline, blocked) and recorded API responses. | Lets us regression-test the block list without burning real API quota or risking exposure during dev. |
| Performance | Xcode Instruments (Time Profiler, Animation Hitches) on real devices, plus an automated benchmark suite that measures conversion time and FPS. | Performance issues only surface on real hardware, especially older iPads. |
| Whole-app behaviour | TestFlight builds installed on family iPads. Structured "kid testing" sessions. | The truest signal of whether the product works is watching a 7-year-old use it without help. |

### 7.2 Kid-testing protocol

Because the success metrics for this app are qualitative (Section 8), we treat real kid sessions as a primary testing tool, not just a final check.

- **Cadence.** At the end of every milestone (see Section 10), at least one structured session with the target kids.
- **Setup.** Hand the iPad over with no instructions beyond "have a go." Watch silently for the first 5 minutes.
- **What to record.** Where they hesitate, what they tap by mistake, what they ignore, what they ask out loud, and where they smile.
- **Outcome.** Each session produces a short written list of friction points, ranked by frequency, that feed the next iteration.

### 7.3 Build and distribution during development

- **Daily development.** Xcode + iOS Simulator on macOS for tight iteration loops.
- **On-device testing.** Direct install via Xcode for the developer's own iPad.
- **Family testing.** TestFlight for distributing builds to family iPads, with up to 90-day build expiry — fine for personal use.
- **Source control and CI.** Git for source control. Optionally GitHub Actions running unit and UI tests on every push, but this is a nice-to-have for a personal-use project.

### 7.4 What we will not test

To keep scope realistic for a personal project:

- No formal usability studies with kids outside the family.
- No load testing — the only network feature is image search and traffic will be trivial.
- No localisation testing — v1 ships in English only.

---

## 8. Success Metrics

Because this is a personal-use app with no analytics, success is qualitative and observed directly:

- Kids return to the app voluntarily across multiple sessions.
- Kids complete at least one full picture without adult help after the first session.
- Kids progress along the difficulty slider over time, of their own accord.
- Kids try out and use the different painting tools (tap, drag, bucket, fill-by-number) rather than sticking to just one.
- No parental complaints about inappropriate search results.
- The app works reliably on long trips without internet.

---

## 9. Open Questions

- **Image search provider.** Which licensed-image API best balances breadth of kid-friendly content, safety filtering, and ease of integration? (Candidates: Openverse, Wikimedia Commons, Pixabay.)
- **Quantisation algorithm.** Should we use median-cut, k-means, or a perceptually weighted variant for the suggested palette? Worth A/B testing on real photos to see which produces the most recognisable result.
- **Edge preservation.** How aggressively should we preserve recognisable edges (faces, outlines) during downsampling so the result still "looks like" the original photo at low grid sizes?
- **Hint mechanic.** Always-on hints, limited hints, or no hints at all — which best matches the difficulty curve we want?
- **Bucket fill connectivity.** 4-connectivity (orthogonal only) is proposed. Should diagonals also count? Worth trying both with kids and seeing which feels more intuitive.

---

## 10. Proposed Milestones

| Phase | Focus                       | Outcome                                                                                                                                              |
| ----- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| M1    | Core engine                 | On-device image → grid + palette conversion, tap & drag to paint, save/resume. Single hard-coded test image. Difficulty slider working end-to-end.   |
| M2    | Local sources               | Photo library import and camera capture. Gallery of saved pieces.                                                                                    |
| M3    | Painting tools and palette  | Bucket fill, fill-by-number, suggested palette generation, palette editing.                                                                          |
| M4    | Safe search                 | Integration with chosen image provider, safety filters, parental toggle.                                                                             |
| M5    | Polish                      | Completion animations, sound design, settings UI, accessibility pass, onboarding flow.                                                               |
| M6    | Family testing              | TestFlight build on family iPads, observe real kids, iterate on friction points.                                                                     |

---

## 11. Backlog (Future Iterations)

Items deliberately deferred from v1 but worth keeping in mind:

- **Export and share finished pixel art.** Save as PNG to the Photos app, share to Messages or AirDrop, print to a connected printer. Likely the first thing to revisit after v1 ships.
- **Speech-to-image generation.** Describe a picture out loud and have one generated to colour. Deferred because it requires network, third-party AI services, and additional safety review.
- **Theme packs.** Curated bundles of safe, pre-converted images (animals, vehicles, fantasy) for kids who don't want to source their own.
- **More accessibility.** Switch Control support, Voice Control for painting, larger-than-default touch targets.
- **iPhone version.** Smaller-screen layout if the iPad version proves popular within the family.
