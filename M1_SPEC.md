# Tappy Colour — M1 Technical Specification

Version 1.0 | April 2026 | For developer agent handoff

> Status note, May 2026: this is a legacy native-iOS handoff and is no longer
> the canonical build direction. The active product is the web PWA in `web/`.
> Use `TappyColour_PRD_v0.3.md`, `M2_SPEC.md`, `PWA_SPEC.md`, and `AGENTS.md`
> for current product and implementation direction.

---

## 1. Project Setup

### 1.1 Xcode Project Configuration

- **Project name:** TappyColour
- **Bundle identifier:** com.tappycolour.app
- **Organisation:** Personal (family use)
- **Language:** Swift 5.9+
- **Interface:** SwiftUI
- **Deployment target:** iPadOS 16.0
- **Supported devices:** iPad only (uncheck iPhone)
- **Orientations:** Portrait and Landscape (all four iPad orientations enabled in Info.plist)
- **Capabilities to enable:** None required for M1. CoreData added via Xcode model editor.
- **CoreData:** Add a `.xcdatamodeld` file named `TappyColour.xcdatamodeld` (check "Use Core Data" in new project wizard).
- **Swift Package Dependencies:** None. M1 uses only Apple frameworks.
- **Frameworks to link:** SwiftUI, CoreData, Accelerate, AVFoundation, CoreGraphics.

### 1.2 Third-Party Dependencies

None.

---

## 2. Full Directory Tree

```
TappyColour/
├── TappyColourApp.swift
├── Info.plist
├── TappyColour.xcdatamodeld/
│   └── TappyColour.xcdatamodel/
│       └── contents
│
├── Engine/
│   ├── PixelGrid.swift
│   ├── Palette.swift
│   ├── ImageConverter.swift
│   ├── KMeansQuantiser.swift
│   └── ConversionSettings.swift
│
├── Model/
│   ├── Artwork.swift
│   ├── ArtworkStore.swift
│   └── PaintingSession.swift
│
├── Views/
│   ├── HomeScreen/
│   │   ├── HomeScreenView.swift
│   │   └── ArtworkThumbnailView.swift
│   ├── DifficultyPicker/
│   │   ├── DifficultyPickerView.swift
│   │   └── ChickRowView.swift
│   ├── PuzzleView/
│   │   ├── PuzzleContainerView.swift
│   │   ├── GridCanvasView.swift
│   │   ├── PaletteStripView.swift
│   │   └── CompletionOverlayView.swift
│   └── Common/
│       └── ConfettiView.swift
│
├── Persistence/
│   └── PersistenceController.swift
│
├── Resources/
│   ├── Assets.xcassets/
│   │   └── BundledImages/  (img_duck, img_cat, img_rocket, img_flower, img_fish, chick)
│   └── Sounds/
│       ├── completion.caf
│       └── tap.caf
│
└── Tests/
    ├── TappyColourTests/
    │   ├── KMeansQuantiserTests.swift
    │   ├── PixelGridTests.swift
    │   ├── ImageConverterTests.swift
    │   └── PaintingSessionTests.swift
    └── TappyColourUITests/
        └── CoreLoopUITests.swift
```

---

## 3. Data Model

### `Engine/PixelGrid.swift`

```swift
struct RGBA8: Equatable, Hashable, Codable {
    var r: UInt8; var g: UInt8; var b: UInt8; var a: UInt8
}

struct GridCell: Equatable {
    var paletteIndex: UInt8
    var painted: Bool
}

struct PixelGrid: Equatable {
    let columns: Int
    let rows: Int
    private(set) var cells: [GridCell]
    private(set) var unpaintedCount: Int
    private(set) var unpaintedPerColour: [Int]

    init(columns: Int, rows: Int, cells: [GridCell])
    mutating func paint(col: Int, row: Int) -> Bool
    mutating func paintCells(_ coords: [(col: Int, row: Int)]) -> [(col: Int, row: Int)]
    mutating func unpaintCells(_ coords: [(col: Int, row: Int)])
    var isComplete: Bool { unpaintedCount == 0 }
    func cell(col: Int, row: Int) -> GridCell
    func unpaintedIndices(forPaletteIndex index: UInt8) -> [Int]
}
```

- Flat `[GridCell]` array, row-major. Index = `row * columns + col`.
- `GridCell` is 2 bytes: 1 byte paletteIndex + 1 byte painted. 80×80 = 12.8 KB total.
- `unpaintedCount` and `unpaintedPerColour` maintained as running counters — O(1) completion detection.
- All mutations go through the mutating methods to keep counters consistent.

### `Engine/Palette.swift`

```swift
struct PaletteColour: Equatable, Codable {
    var rgba: RGBA8
    let number: Int   // 1-based display label
}

struct Palette: Equatable, Codable {
    var colours: [PaletteColour]
    let originalColours: [PaletteColour]
    mutating func replaceColour(at index: Int, with rgba: RGBA8)
    mutating func reset()
    func swiftUIColor(at index: Int) -> Color
}
```

### `Model/Artwork.swift`

```swift
struct Artwork: Identifiable, Equatable {
    let id: UUID
    var title: String
    var bundledImageName: String
    var grid: PixelGrid
    var palette: Palette
    var conversionSettings: ConversionSettings
    var createdAt: Date
    var lastModifiedAt: Date
    var isComplete: Bool
}
```

### `Engine/ConversionSettings.swift`

```swift
struct ConversionSettings: Equatable, Codable {
    var sliderValue: Float
    var gridSize: Int    // 16 at 0.0 → 80 at 1.0
    var paletteSize: Int // 6 at 0.0 → 24 at 1.0

    static func make(sliderValue: Float) -> ConversionSettings
    // gridSize  = Int(16 + sliderValue * 64) clamped to [16, 80]
    // paletteSize = Int(6 + sliderValue * 18) clamped to [6, 24]
}
```

---

## 4. Image-to-Grid Conversion Engine

### `Engine/KMeansQuantiser.swift`

**Algorithm: k-means with k-means++ initialisation**

Justification over median-cut: k-means finds actual population centroids — palette slots go to the colours the child *sees most*. On 6,400 pixels with k≤24 it converges in <50ms using Accelerate.

```swift
struct KMeansQuantiser {
    static func quantise(
        pixels: [RGBA8],
        k: Int,
        maxIterations: Int = 20
    ) -> (centroids: [RGBA8], assignments: [Int])
}
```

Implementation:
1. k-means++ init: pick first centroid randomly, each subsequent one sampled proportionally to squared RGB distance from nearest existing centroid.
2. Distance: Euclidean in RGB space (`dR²+dG²+dB²`). Alpha ignored.
3. Accelerate: expand UInt8 pixels to Float32 R/G/B buffers; use `vDSP` for distance computation.
4. Empty cluster recovery: if a cluster has 0 pixels, reinitialise to the pixel with greatest distance to any centroid.
5. Convergence: stop if no pixel changes cluster, or after `maxIterations`.

### `Engine/ImageConverter.swift`

```swift
actor ImageConverter {
    func convert(image: UIImage, settings: ConversionSettings) async throws -> (grid: PixelGrid, palette: Palette)
}
```

Pipeline:
1. Resize UIImage to `gridSize × gridSize` via `CGContext` (aspectFill, centre-crop). Extract `[RGBA8]`.
2. Run `KMeansQuantiser.quantise(pixels:k:)`.
3. Map centroids → `Palette`.
4. Map assignments → `[GridCell]` (all unpainted). Construct `PixelGrid`.

Errors: `ConversionError.imageTooSmall`, `ConversionError.quantisationFailed`.

---

## 5. Canvas Renderer

### `Views/PuzzleView/GridCanvasView.swift`

```swift
struct GridCanvasView: View {
    @ObservedObject var session: PaintingSession
    var availableSize: CGSize
    // cellSize = floor(min(availableSize.width, availableSize.height) / CGFloat(columns))
}
```

Drawing — two passes in Canvas closure:
1. Fill all cells: painted cells use palette colour, unpainted use `Color(white: 0.96)`.
2. Number overlay on unpainted cells: `context.draw(Text(...), at:)`, font size = `cellSize * 0.45`. Skip pass 2 when `session.numbersVisible == false`.

60fps at 80×80 is achievable with full redraw — Canvas batches draw calls internally. Pre-cache `GraphicsContext.Shading` per palette colour if profiling shows hitch.

---

## 6. Painting Session

### `Model/PaintingSession.swift`

```swift
@MainActor
final class PaintingSession: ObservableObject {
    @Published private(set) var grid: PixelGrid
    @Published private(set) var palette: Palette
    @Published var selectedPaletteIndex: Int
    @Published private(set) var isComplete: Bool = false
    @Published var numbersVisible: Bool = true

    private var undoStack: [(action: UndoAction, cells: [(col: Int, row: Int)])] = []
    private var currentDragPainted: Set<CellCoord> = []
    let artworkID: UUID

    func tap(col: Int, row: Int)
    func dragBegan()
    func dragMoved(col: Int, row: Int)
    func dragEnded()
    func bucketFill(col: Int, row: Int)
    func fillAllOfNumber()
    func undo()
    func replacePaletteColour(at index: Int, with rgba: RGBA8)
    func resetPalette()
}
```

Key behaviours:
- **Drag dedup:** `Set<CellCoord>` cleared on `dragBegan`, checked on `dragMoved`. O(1) per cell.
- **Auto-advance:** after any paint, if current colour is complete, advance `selectedPaletteIndex` to next incomplete.
- **Completion:** `grid.isComplete` is O(1). On true: set `isComplete`, delay 0.5s then animate `numbersVisible = false`, play sound.
- **Undo:** single-step stack. Each entry stores `(col,row)` pairs changed by that action. `undo()` calls `grid.unpaintCells`.
- **Bucket fill:** 4-connectivity BFS. Stops at cells of different paletteIndex or already-painted cells.

---

## 7. Gesture Handling

### `Views/PuzzleView/PuzzleContainerView.swift`

- Zoom: `MagnificationGesture`. Min scale 1.0, max scale `44 / cellSizeAtMinZoom` (ensures 44pt tap targets).
- Pan: two-finger `DragGesture` on outer container.
- Paint drag: single-finger `DragGesture` on `GridCanvasView`.
- Cell coord conversion: `col = Int(location.x / cellSize)`, `row = Int(location.y / cellSize)`.

---

## 8. CoreData Schema

### Entity: `ArtworkEntity`

| Attribute | Type | Notes |
|---|---|---|
| id | UUID | indexed |
| title | String | |
| bundledImageName | String | |
| createdAt | Date | |
| lastModifiedAt | Date | |
| isComplete | Boolean | default false |
| sliderValue | Float | default 0.0 |
| gridColumns | Integer 16 | |
| gridRows | Integer 16 | |
| paletteData | Binary Data | JSON-encoded `[PaletteColour]` |
| originalPaletteData | Binary Data | JSON-encoded `[PaletteColour]` |
| paintStateData | Binary Data | 1 byte/cell: bit7=painted, bits0-6=paletteIndex |

`paintStateData` encoding: `byte = (painted ? 0x80 : 0x00) | paletteIndex`. 80×80 = 6,400 bytes.

### `Persistence/PersistenceController.swift`

```swift
final class PersistenceController {
    static let shared = PersistenceController()
    let container: NSPersistentContainer
    init(inMemory: Bool = false)  // inMemory=true for unit tests
}
```

### `Model/ArtworkStore.swift`

```swift
@MainActor
final class ArtworkStore: ObservableObject {
    @Published private(set) var artworks: [Artwork] = []
    func fetchAll()
    func save(artwork: Artwork)   // upsert by id, background context
    func delete(artwork: Artwork)
}
```

---

## 9. Views Summary

### HomeScreenView
- `NavigationStack` + `LazyVGrid` (2 cols portrait, 3 landscape).
- Each cell: `ArtworkThumbnailView` — thumbnail + progress %.
- Tap with no existing Artwork → `DifficultyPickerView`.
- Tap with in-progress Artwork → `PuzzleContainerView`.

### DifficultyPickerView
- Slider `0.0–1.0`, persisted to `UserDefaults("lastDifficultySliderValue")`.
- `ChickRowView`: `n = Int(1 + sliderValue * 9)` chick images, `.interpolation(.none)`, spring animation.
- On confirm: run `ImageConverter.convert` async, save to `ArtworkStore`, navigate to puzzle.

### PaletteStripView
- Horizontal `ScrollView` of `PaletteEntryView` items (44×44pt swatch, number, "12/40" progress, checkmark when done, selection ring).
- Tap to change `session.selectedPaletteIndex`.

### CompletionOverlayView
- Triggered by `session.isComplete`.
- Sequence: 0.5s delay → fade numbers (0.8s) → show `ConfettiView` + sound → "You did it!" + home button.

### ConfettiView
- `TimelineView(.animation)` with 40 `ConfettiParticle` structs.
- Each particle: position, velocity (upward initial), gravity, colour, rotation, opacity (decreasing).
- Drawn via `Canvas` as small filled rectangles.

---

## 10. Bundled Images

| Name | Subject | Purpose |
|---|---|---|
| `img_duck` | Yellow rubber duck | Easiest — single dominant colour |
| `img_cat` | Cartoon tabby cat | 2-3 colours, clear at 20×20 |
| `img_rocket` | Cartoon rocket | Bold contrasting colours, mid difficulty |
| `img_flower` | Sunflower | Tests analogous colour quantisation |
| `img_fish` | Tropical fish | High colour variety, hard difficulty |
| `chick` | Pixel-art chick 32×32 | Difficulty slider visualisation |

All PNG, square-cropped, min 256×256px source. Chick at 32×32px (1x/2x/3x), use `.interpolation(.none)`.

---

## 11. Unit Tests

### KMeansQuantiserTests
- `testUniformImage` — all same colour → 1 centroid
- `testTwoColourImage` — 2 distinct colours → 2 accurate centroids
- `testEmptyClusterRecovery` — k > unique colours → no crash, k valid centroids
- `testPerformance` — 6400 pixels, k=24 → under 200ms
- `testAssignmentLengthMatchesInput`
- `testAssignmentBoundsAreValid` — all in [0, k-1]
- `testCentroidCountEqualsK`

### PixelGridTests
- `testInitialUnpaintedCount` — equals columns × rows
- `testPaintDecrementCount`
- `testPaintIdempotency` — painting same cell twice doesn't double-decrement
- `testUnpaintedPerColourInit`
- `testUnpaintedPerColourDecrement` — only decrements correct colour slot
- `testIsCompleteOnlyWhenFullyPainted`
- `testUnpaintCells`
- `testPaintCellsReturnsDiff` — returns only changed cells
- `testUnpaintedIndicesForPaletteIndex`

### ImageConverterTests
- `testMinimalConversion` — 2×2 image, 2 colours → correct dimensions
- `testOutputGridDimensions`
- `testCellPaletteIndicesInRange`
- `testAllCellsInitiallyUnpainted`
- `testOriginalColoursMatchInitialPalette`
- `testUniformColourConvertsAccurately` — centroid within ±10 per channel
- `testEasyDifficultyDimensions` — sliderValue=0 → 16×16, palette=6
- `testHardDifficultyDimensions` — sliderValue=1 → 80×80, palette=24

### PaintingSessionTests
- `testTapPaintsCorrectCell`
- `testTapWrongColourIsNoOp`
- `testDragPaintsCorrectCells`
- `testDragDoesNotRepaintInSameGesture`
- `testUndoRevertsLastTap`
- `testUndoRevertsLastDrag`
- `testUndoOnEmptyStack`
- `testAutoAdvanceOnCompletion`
- `testIsCompleteTransition`
- `testBucketFillConnectedRegion`
- `testBucketFillDoesNotCrossColourBoundary`
- `testFillAllOfNumber`

Test helper: `makeTestArtwork(columns:rows:pattern:)` — builds an `Artwork` with known paletteIndex values without depending on `ImageConverter`.
