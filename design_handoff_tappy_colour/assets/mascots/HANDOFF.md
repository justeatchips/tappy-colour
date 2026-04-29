# Tappy Colour — Mascot Handoff

11 mascots, 32×32 native pixel art, designed for an iPad-first web app and iOS app.

## Roster

| ID | Name | Species | Pronouns |
|---|---|---|---|
| `pip` | Pip | Chick | they/them |
| `rosie` | Rosie | Bunny | she/her |
| `bo` | Bo | Bear | he/him |
| `mochi` | Mochi | Cat | she/her |
| `finn` | Finn | Frog | he/him |
| `luna` | Luna | Fox | she/her |
| `bibi` | Bibi | Octopus | they/them |
| `sprout` | Sprout | Dino | they/them |
| `sparkle` | Sparkle | Unicorn | she/her |
| `plop` | Plop | Poo | they/them |
| `sunny` | Sunny | Smiley | they/them |

See `sprite-sheet-4x.png` for visual reference.

## Files in this folder

```
assets/mascots/
├─ HANDOFF.md                 ← this file
├─ mascots.json               ← raw sprite data + palettes + animation spec
├─ sprite-sheet-4x.png        ← all 11 mascots, single image
├─ svg/
│  ├─ pip.svg                 ← static, infinite-scale (use for web)
│  ├─ pip-animated.svg        ← embeds the bob animation as <style>
│  └─ ... (× 11 mascots)
└─ png/
   ├─ pip-1x.png              ← 32×32 native
   ├─ pip-2x.png              ← 64×64
   ├─ pip-3x.png              ← 96×96 (iOS @3x for ~32pt display)
   ├─ pip-4x.png              ← 128×128
   ├─ pip-8x.png              ← 256×256 (hero / completion screen)
   └─ ... (× 11 mascots)
```

## Sprite spec

- **Native resolution:** 32×32 pixels
- **Pixel rendering:** nearest-neighbour. Any smoothing destroys the look.
- **Transparency:** background is transparent — no padding bleed.
- **No drop shadow baked in.** Apply at the platform level (CSS `box-shadow`, SwiftUI `.shadow`).

## Sizing on iPad

Recommended logical-point sizes for the iPad UI:

| Use case | Size | Render with |
|---|---|---|
| Chip / list item | 24–32 pt | `*-1x.png` or SVG |
| Avatar / mascot card | 56–88 pt | `*-2x.png` or SVG |
| Difficulty hero / onboarding | 200–260 pt | `*-8x.png` or SVG |
| Completion celebration | 140–180 pt | `*-4x.png` or SVG |

**Rule:** size in logical points should be a multiple of 32 where possible (32, 64, 96, 128, 192, 256) so each native pixel maps to a whole number of device pixels. Off-grid sizes (e.g. 50pt) blur even with nearest-neighbour.

## Animation: the "bob"

Every mascot bobs gently when active (selected on onboarding, on the difficulty/completion screens, when celebrating). Idle mascots stay still.

Spec:
- Duration: **1400ms**, infinite, timing: `steps(2)` (intentional — no smoothing)
- Transform origin: `50% 90%` (rotates around feet)
- Keyframes:
  - 0% / 100%: `translateY(0) rotate(-2deg)`
  - 50%: `translateY(-1px) rotate(2deg)`

> **Why `steps(2)`?** It keeps the animation feeling like 2-frame pixel-art animation — punchy, not floaty. A linear ease would betray the pixel aesthetic.

### Web — CSS

```css
.mascot-bob {
  transform-origin: 50% 90%;
  animation: mascot-bob 1.4s steps(2) infinite;
}
@keyframes mascot-bob {
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  50%      { transform: translateY(-1px) rotate(2deg); }
}
```

```html
<img src="/assets/mascots/svg/pip.svg" class="mascot-bob" width="88" height="88" alt="Pip"/>
```

The animated SVGs (`*-animated.svg`) embed this animation directly — useful when you can't add a class to the image (e.g. CSS `background-image`). Otherwise prefer the static SVG + a class.

### iOS — SwiftUI

```swift
struct MascotView: View {
    let id: String   // "pip", "rosie", ...
    let size: CGFloat

    @State private var bobUp = false

    var body: some View {
        Image(uiImage: UIImage(named: "\(id)-2x")!) // pick scale to match `size`
            .interpolation(.none)                    // critical: nearest-neighbour
            .resizable()
            .frame(width: size, height: size)
            .rotationEffect(.degrees(bobUp ? 2 : -2), anchor: .bottom)
            .offset(y: bobUp ? -size * 0.012 : 0)    // ~1px at native, scaled
            .animation(
                .linear(duration: 0.7)
                    .repeatForever(autoreverses: true),
                value: bobUp
            )
            .onAppear { bobUp = true }
    }
}
```

> **`.interpolation(.none)`** is the SwiftUI equivalent of `image-rendering: pixelated`. Without it, the OS smooths the upscale and the pixels go fuzzy.

### iOS — UIKit

```swift
let mascot = UIImageView(image: UIImage(named: "pip-2x"))
mascot.layer.magnificationFilter = .nearest
mascot.layer.minificationFilter = .nearest
mascot.frame = CGRect(x: 0, y: 0, width: 88, height: 88)

UIView.animate(
    withDuration: 0.7,
    delay: 0,
    options: [.repeat, .autoreverse, .curveLinear],
    animations: {
        mascot.transform = CGAffineTransform(rotationAngle: .pi / 90) // 2°
            .translatedBy(x: 0, y: -1)
    }
)
```

### Asset catalog naming (iOS)

Drop the PNGs into `Assets.xcassets`:

```
Mascots.xcassets/
└─ Pip.imageset/
   ├─ Contents.json
   ├─ pip.png       ← rename pip-1x.png
   ├─ pip@2x.png    ← rename pip-2x.png
   └─ pip@3x.png    ← rename pip-3x.png
```

iPad Pro (Retina) uses `@2x`. iPhones with @3x screens get `@3x`. Then load with `UIImage(named: "Pip")`.

## Web — preferred integration

```jsx
import { mascotsByID } from './mascots.json';

function Mascot({ id, size = 88, animated = true }) {
  return (
    <img
      src={`/assets/mascots/svg/${id}.svg`}
      width={size} height={size}
      className={animated ? 'mascot-bob' : ''}
      alt={mascotsByID[id].name}
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
```

For best caching, ship the SVGs as static assets and let the browser cache them — they're 1–4 KB each.

## mascots.json structure

```json
{
  "version": "1.0.0",
  "spriteSize": { "width": 32, "height": 32 },
  "paletteRoles": {
    "a": "body main fill",
    "b": "body outline / dark shade",
    "...": "..."
  },
  "animation": { ... },
  "mascots": [
    {
      "id": "pip",
      "name": "Pip",
      "kind": "chick",
      "tag": "they/them",
      "tokens": { "body": "#ffd25f", "accent": "#ff8a3d", "cheek": "#ff9bbd" },
      "palette": { "a": "#ffd25f", "b": "rgb(...)", ... },
      "rows": ["................................", ...]
    },
    ...
  ]
}
```

`rows` is the raw 32×32 sprite data — each character is a key into `palette`, `.` means transparent. Engineers can render natively from this if they prefer (SwiftUI `Canvas`, Compose `Canvas`, etc.) instead of consuming PNGs.

## Color tokens

Per-mascot brand colors (the `tokens` object in JSON):

| ID | body | accent | cheek |
|---|---|---|---|
| pip | `#ffd25f` | `#ff8a3d` | `#ff9bbd` |
| rosie | `#ffc0d6` | `#ff5fa2` | `#ff7aa6` |
| bo | `#c79a6b` | `#7a4a26` | `#ff9bbd` |
| mochi | (see JSON) | | |
| ... | | | |

For unicorn (Sparkle) and poo (Plop), the body/accent are overridden in the palette — see `paletteRoles` and the per-mascot `palette` block in `mascots.json` for the actual rendered colors.

## Platform checklist

### Web
- [ ] Copy `assets/mascots/svg/` and `assets/mascots/png/` into `public/`
- [ ] Add `.mascot-bob` keyframes to global CSS
- [ ] Render via `<img>` with `image-rendering: pixelated` for PNG, or use SVG (no flag needed)
- [ ] Ensure parent containers don't apply CSS filters or `transform: scale()` that introduce subpixel rendering — wrap in an integer-pixel container

### iOS
- [ ] Drag PNG assets into `Mascots.xcassets`, named per-mascot
- [ ] Verify `.interpolation(.none)` (SwiftUI) or `.nearest` magnification filter (UIKit)
- [ ] Confirm sizes are integer multiples of 32pt where the design uses heroes
- [ ] Reuse the same easing/timing — don't substitute spring animations or the feel changes
