# Handoff: Tappy Colour

A pixel-art "tap-by-number" colouring app for kids (iPad-first web app + iOS app companion). User picks a mascot buddy → browses puzzles → picks difficulty → taps numbered cells to fill them with colour → celebration screen.

## About the Design Files

The HTML/JSX files in `prototype/` are **design references** — they are clickable mockups built in React-via-Babel-in-the-browser to show intended look, layout, and interaction. **They are not production code.** Your job is to recreate these designs in the target codebase using its existing patterns and libraries (React/Next, SwiftUI, etc.). If no codebase exists yet, choose the most appropriate framework — for a "iPad-first web app + iOS companion" brief, **Next.js + React + TypeScript on web** and **SwiftUI on iOS** are the recommended starting points.

The mascot assets in `assets/mascots/` ARE production-ready — drop them straight into the real codebase.

## Fidelity

**High-fidelity.** Final colours, typography, spacing, border treatments, shadows, and interactions are pinned down. Recreate pixel-perfectly. The only thing that's not final is real puzzle artwork beyond the four samples (unicorn, kitty, rocket, sunflower) — those exist for the prototype only; production will need many more puzzles authored.

## Visual Vocabulary (the "Pixel Native" direction)

The chosen aesthetic is a chunky, pixel-art-inspired retro look. Every interactive element shares the same construction:

- **4px solid black border** (`#1a1020`) on every panel, button, card.
- **6px hard offset shadow** in the same black, no blur (`box-shadow: 0 6px 0 0 #1a1020`).
- **6px border-radius** — slight rounding, never pill-shaped.
- **No CSS gradients on UI chrome.** Solid fills only. Gradients are reserved for the dot-pattern background.
- **Display type uses pixel/rounded fonts** with a **3px hard text-shadow** in ink-black.
- **Step animations** (`steps(2)` or `steps(3)`) — never smooth easing. The whole app feels like a 2-frame pixel-art sprite animation.

## Screens

There are 6 screens. Each is implemented as a `<Screen>` wrapper with a `data-screen-label` attribute and a dotted radial-gradient background.

### 1. Onboarding — `prototype/tc/proto/onboarding.jsx`
- Single-step "Pick your buddy" mascot picker.
- Header: small step indicator (`★ STEP 1 OF 1 ★`, 12px, pixel font, `inkSoft` colour) + 48px display title `PICK YOUR BUDDY` + 14px subtitle `they cheer you on while you colour`.
- 6-column grid of 130×130 mascot cards (gap: 14px). Each card: white panel, 4px ink border, 4px ink hard shadow. Selected state: card translates up 2px, shadow + border become `theme.primary` (sky blue), background tints to `primarySoft`.
- Card content: 88px PixelMascot sprite, then mascot NAME (pixel display, 14px, letter-spacing 1), then pronouns (10px, soft).
- Big CTA at bottom: `▶ THAT'S THE ONE!` (size lg PxButton, primary colour, min-width 280px).
- Hint text below CTA: `tap a buddy then press the button`.

### 2. Home — `prototype/tc/proto/home.jsx`
- Header row: 56px PixelMascot panel · greeting (`HI ROSIE!`, 12px display, soft) + `TAPPY COLOUR` 40px display title · settings cog button (white, 60px wide).
- Three big action buttons (`📷 CAMERA`, `🖼 PHOTOS`, `🔍 SEARCH`) — solid-fill, white text, primary/accent/mint colours. 22px display type, gap 14px, 20×18px padding, flex-equal width up to 300px each.
- Section heading: `★ TAP A PICTURE ★` (18px display, centred).
- 4-column gallery grid (gap 16px). Each tile: white card, 4px ink border, 6px ink hard shadow. Inside: square thumbnail with `bgAlt` background and 8px padding showing the puzzle's painted state (SVG, see `PuzzleThumb`), then puzzle title (14px display), then either a progress bar (8px tall, 2px ink border, primary fill) with percentage, or `★ DONE` (11px, primary colour) if complete.

### 3. Difficulty — `prototype/tc/proto/difficulty.jsx`
- Mascot greeting card with chosen mascot bobbing.
- Big "How hard?" slider with 3 stops. Each stop is its own pixel-bordered tile labelled EASY / MEDIUM / HARD with a numeric grid-size hint (8×8 / 16×16 / 24×24).
- Selected stop: primary fill, white text, lifted shadow.
- BACK and START buttons at bottom.

### 4. Puzzle — `prototype/tc/proto/puzzle.jsx`
- Top bar: home button · puzzle title · undo button.
- Main canvas: SVG grid of cells, each showing its number until tapped. When the active palette colour matches the cell's number, tap fills it with that colour. Wrong colour = small shake animation, no fill. Cell size scales to fit.
- Bottom: horizontal palette strip. Each swatch is a 64×64 colour chip with the palette index in the corner. Selected swatch lifts and gets primary border.
- Tools row (above palette): brush, fill-bucket, undo, reset (gated behind parental modal).
- Mascot in corner reacts: bobs faster as completion approaches, jumps on completion.

### 5. Completion — `prototype/tc/proto/completion-settings.jsx`
- Confetti burst (CSS keyframe step animation).
- 256px hero mascot, animated bob.
- `★ ALL DONE! ★` 64px display title, primary colour with ink shadow.
- Two buttons: `HOME` (white) and `NEW PICTURE` (primary).
- Final painted artwork shown at large scale below.

### 6. Settings (modal) — `prototype/tc/proto/completion-settings.jsx`
- Slides up from bottom, ink-bordered panel on dimmed scrim.
- **Parental gate** blocks settings until user solves a simple math problem (`What is 3 + 5?`) — kid-proofs destructive actions.
- Once gated: Theme picker (4 themes), Font picker (3 stacks), Reset progress (red destructive button), Close.

## Design Tokens

All tokens live in `prototype/tc/tokens.jsx`. Lift them verbatim — colour values, font stacks, mascot definitions, sample palettes are final.

### Themes (the prototype ships with `sky` as the default)

| Token         | Sky (default) | Candy     | Sunny     | Cream     |
|---------------|---------------|-----------|-----------|-----------|
| `bg`          | #eaf6ff       | #fff1f7   | #fff7e6   | #fbf6ee   |
| `bgAlt`       | #d4ecff       | #fde6f0   | #ffeccd   | #f3ead8   |
| `surface`     | #ffffff       | #ffffff   | #ffffff   | #ffffff   |
| `ink`         | #1f2e4a       | #3a2a4a   | #4a2e1a   | #2a2620   |
| `inkSoft`     | #5a6a8a       | #7a5d8a   | #8a6a4a   | #7a6e5a   |
| `primary`     | #3da9ff       | #ff5fa2   | #ff8a3d   | #e8704d   |
| `primarySoft` | #bfe1ff       | #ffd0e3   | #ffd5b8   | #f8c8b6   |
| `accent`      | #7adfc1       | #a78bfa   | #ff5fa2   | #7d8c5a   |

> Note: in the prototype the *sprite* outline / "ink black" is hard-coded `#1a1020` for max contrast on every theme. Use that, not the per-theme `ink` colour, for sprite outlines and chunky borders. Theme `ink` is for type and softer borders.

### Spacing
- Border width: **4px** on all chrome (panels, buttons, cards).
- Hard shadow offset: **6px** primary, sometimes **4px** for nested/secondary cards.
- Border radius: **6px** universal.
- Internal padding: 8/12/16/20/28 (no other values used).
- Grid gaps: 14px (tight), 16px (standard).

### Typography (3 stacks, in `tokens.jsx → TC_FONTS`)

The prototype's *prototype* mode (the actual clickable demo) uses **Pixelify Sans** for display and **Nunito** for body. The design canvas explores three system options (`rounded`, `storybook`, `pixel`). **Ship with the pixel direction** — display in **Pixelify Sans 400/700**, body in **Nunito 400/600/700/800**, mono in **DM Mono**.

- Display sizes used: 12 (label), 14 (card title), 18 (section), 22 (button-lg), 36–48 (screen title), 64 (celebration).
- Letter-spacing: 0.5px on buttons, 1px on labels and small all-caps text.
- All display headings get a `text-shadow: 3px 3px 0 var(--ink)`.

### Mascots (final list — 11 total, in `tokens.jsx → TC_MASCOTS`)

`pip` (chick), `rosie` (bunny), `bo` (bear), `mochi` (cat), `finn` (frog), `luna` (fox), `bibi` (octopus), `sprout` (dino), `sparkle` (unicorn), `plop` (poo), `sunny` (smiley).

Each has `body`, `accent`, `cheek`, and `tag` (pronouns, displayed under name) fields. **Production should render the SVG/PNG sprites from `assets/mascots/`, not the CSS-shape `<PixelMascot>` placeholder used in the prototype.** See `Mascot Asset Spec.html` for the full handoff.

## Interactions & Behaviour

- **Step-based animations only.** All transitions use `steps(2)` or `steps(3)`. No smooth easing.
- **Press feedback:** `PxButton` translates Y +6px on press and drops its shadow to 0 — looks like the button is being physically pressed into its socket.
- **Mascot bob:** active mascot rotates -2° → 2° on a 1.4s `steps(2) infinite` loop with origin at bottom centre.
- **Painting:** tap a numbered cell with the matching palette colour active → cell fills with that colour. Tap with wrong colour → cell shakes briefly. Once filled, cell is permanent (use Undo to revert one step).
- **Undo:** stack of last N paint actions, capped at ~50.
- **Persistence:** the prototype persists state in `localStorage` under `tappyColourProtoState_v1`. In production, store per-puzzle progress in a real backend keyed by user ID (anonymous device-id is fine for v1).
- **Parental gate:** any destructive setting (reset progress, IAP, account) is blocked behind `What is 3 + 5?` math gate. Don't ship a destructive action without one.
- **Completion:** when last cell is painted, navigate to Completion screen after 800ms delay (lets the user see the final cell fill).

## State Management

Single root state object (see `tc/proto/app.jsx → ProtoApp`):

```ts
type AppState = {
  route: 'onboarding' | 'home' | 'difficulty' | 'puzzle' | 'completion';
  mascotId: string | null;       // selected mascot id
  puzzleId: string;              // currently-active puzzle
  difficulty: number;            // 0..1, maps to grid size
  painted: { [puzzleId: string]: { [cellKey: string]: number } };
};
```

Recommend Zustand or Redux Toolkit on web; `@Observable` on SwiftUI. The prototype's plain `useState` + `useEffect`-to-localStorage pattern is fine to mimic at v1.

## Assets

Everything in `assets/mascots/` is production-ready. See `assets/mascots/HANDOFF.md` and `Mascot Asset Spec.html` for the full doc. Key facts:

- **Native size: 32×32 pixels.** Always upscale by integer multiples (32, 64, 96, 128, 192, 256). Never display at 50px or other off-grid sizes — pixel art blurs.
- **Web:** use `assets/mascots/svg/<id>.svg` (1–4 KB each, infinite scale, no `image-rendering` flag needed). Animated variant: `<id>-animated.svg`.
- **iOS:** drop `assets/mascots/png/<id>-{1,2,3,4,8}x.png` into `Assets.xcassets`. **Critical:** set `.interpolation(.none)` in SwiftUI / `magnificationFilter = .nearest` in UIKit, or the upscale blurs.
- **Bob animation:** rotate -2° → 2° from a bottom anchor, 1.4s `steps(2) infinite`. Don't substitute spring physics.

Sample puzzle artwork (4 puzzles for prototype only): `prototype/tc/proto/app.jsx → PUZZLES`. Production will need many more — those are authored as 16×16 character grids where each digit (1..N) maps to a palette index.

## Files In This Bundle

```
design_handoff_tappy_colour/
├─ README.md                      ← you are here
├─ Mascot Asset Spec.html         ← open in browser; engineer-facing mascot doc
├─ assets/mascots/                ← 11 mascots × {svg static, svg animated, 5 png sizes} + sprite sheet + JSON
└─ prototype/
   ├─ Tappy Colour Prototype.html ← clickable demo (open in browser)
   ├─ Tappy Colour Designs.html   ← all-in-one design canvas (3 vibe directions × 6 screens)
   ├─ design-canvas.jsx           ← canvas component for the Designs file
   └─ tc/
      ├─ tokens.jsx               ← FINAL design tokens — lift verbatim
      ├─ atoms.jsx                ← rounded-style atoms (one of three vibes; not shipped)
      ├─ pixel-atoms.jsx          ← FINAL pixel atoms (PxPanel, PxButton, PxTitle, PixelMascot)
      ├─ screens-paper.jsx        ← vibe explore: paper-craft direction (not shipped)
      ├─ screens-pixel.jsx        ← FINAL pixel-direction screen variants
      ├─ screens-squishy.jsx      ← vibe explore: squishy-3D direction (not shipped)
      └─ proto/                   ← FINAL prototype screens — lift these
         ├─ app.jsx               ← root, state, navigation, sample PUZZLES
         ├─ onboarding.jsx
         ├─ home.jsx
         ├─ difficulty.jsx
         ├─ puzzle.jsx
         └─ completion-settings.jsx
```

To run the prototype locally: open `prototype/Tappy Colour Prototype.html` directly in a modern browser. State persists to localStorage.

## Open Questions for Product

These were not pinned down during design and will need decisions before/during implementation:

1. **Puzzle authoring pipeline.** The prototype hard-codes 4 puzzles as character grids. Production needs either an authoring tool, or an artist-friendly format (Aseprite export → JSON converter is recommended).
2. **Camera / Photos / Search buttons on Home.** The prototype shows them but they all just navigate to the first puzzle. Real behaviour TBD — likely "convert a photo into a tappable puzzle" via colour-quantization on the server.
3. **IAP / paywall.** No paywall designed yet. Behind parental gate when added.
4. **Accessibility.** Pixel fonts at small sizes are not WCAG-compliant. Either keep pixel font for display only (current direction is correct) or ship a "readable mode" toggle in Settings.
5. **Sound.** No audio designed. Recommend SFX on cell-paint and completion.
