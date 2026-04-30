# Tappy Colour UX System

This document is the production UI contract for the web PWA. It turns the
Pixel Native design handoff into rules that future code should follow.

## Direction

Tappy Colour should feel like a clean, playful pixel-art toy: tactile, bright,
simple to scan, and built for children using touch. Avoid generic admin-app
styling. The painting canvas is the main event; UI chrome should support it
without becoming visually noisy.

## Tokens

- Use CSS custom properties in `src/styles/global.css` for all shared colour,
  spacing, typography, border, radius, and shadow values.
- The default theme is Sky from the design handoff.
- `--tc-ink-black` is the border and hard-shadow colour for chunky chrome.
- Use `--tc-bg`, `--tc-bg-alt`, `--tc-surface`, `--tc-ink`,
  `--tc-ink-soft`, `--tc-primary`, `--tc-primary-soft`, and `--tc-accent`
  instead of raw colours in views.
- New theme colours belong in tokens first, then components.

## Typography

- Display labels, headings, buttons, stats, and palette numbers use
  `--tc-font-display`.
- Longer instructions, empty states, and body copy use `--tc-font-body`.
- Small counters can use `--tc-font-mono`.
- Keep text short. Prefer icon plus label for commands children need to repeat.

## Component Rules

- Panels, cards, important buttons, and major controls use:
  - 4px ink-black border
  - 6px hard ink-black shadow
  - 6px radius
  - solid fills
- Secondary controls can use a 3px border and 4px shadow.
- Use existing primitives before adding one-off markup:
  - `.px-panel`
  - `.px-button`
  - `.tc-icon-button`
  - `.tc-topbar`
  - `.tc-tool-strip`
  - `.palette-strip`
  - `.tc-modal-scrim`
  - `.tc-toast`
- TypeScript helpers live in `src/ui/pixel.ts`. Keep them small and boring.

## Motion

- Motion should feel like two or three pixel-art frames.
- Use `steps(2)` or `steps(3)` for UI motion.
- Button press feedback should move the control into its shadow socket.
- Smooth easing is reserved for browser-native scrolling or canvas-only cases
  where the interaction would otherwise feel broken.
- Respect `prefers-reduced-motion`.

## Touch And Accessibility

- Interactive controls must be at least 44px by 44px.
- Icon-only buttons require an `aria-label`.
- Preserve native `button` and `input` semantics.
- Focus states must be visible and use the design tokens.
- Keep palette and toolbar controls reachable by keyboard and assistive tech.

## Inline Style Policy

Avoid `style.cssText` in views. Use classes and tokens instead.

Allowed inline style cases:

- Dynamic palette colours.
- Dynamic progress widths.
- Canvas dimensions and rendering state.
- Element visibility where the state is local and simple, though `hidden` is
  preferred.
- Coordinates calculated from DOM geometry, such as coach marks.

If a style value is static, it belongs in CSS.

## Adding Future Features

When adding a feature:

1. Choose an existing primitive or add a reusable primitive first.
2. Add state via attributes/classes such as `aria-current`, `aria-pressed`,
   `data-active`, or `hidden`.
3. Keep screen-specific CSS small and named after the screen.
4. Add a focused test if the feature introduces a new interaction or visual
   guardrail.
5. Run `npm run test` and `npm run build` from `web/`.
