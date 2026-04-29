import XCTest
@testable import TappyColour

@MainActor
final class PaintingSessionTests: XCTestCase {

    // MARK: - Helpers

    private func makeSession(cols: Int = 4, rows: Int = 2, colours: Int = 2) -> PaintingSession {
        // Cells alternate paletteIndex 0 and 1: [0,1,0,1, 0,1,0,1]
        let cells = (0..<cols * rows).map { i in
            GridCell(paletteIndex: UInt8(i % colours), painted: false)
        }
        let paletteColours = (0..<colours).map { i in
            PaletteColour(rgba: RGBA8(r: UInt8(i * 80), g: 0, b: 0), number: i + 1)
        }
        let grid = PixelGrid(columns: cols, rows: rows, cells: cells)
        let palette = Palette(colours: paletteColours, originalColours: paletteColours)
        let artwork = Artwork(
            id: UUID(), title: "Test", bundledImageName: "test",
            grid: grid, palette: palette,
            conversionSettings: ConversionSettings.make(sliderValue: 0.0),
            createdAt: Date(), lastModifiedAt: Date(), isComplete: false
        )
        return PaintingSession(artwork: artwork)
    }

    // MARK: - Tap

    func testTapPaintsCorrectCell() {
        let session = makeSession()
        session.selectedPaletteIndex = 0
        // Cell (0,0) has paletteIndex 0
        session.tap(col: 0, row: 0)
        XCTAssertTrue(session.grid.cell(col: 0, row: 0).painted)
    }

    func testTapWrongColourIsNoOp() {
        let session = makeSession()
        session.selectedPaletteIndex = 1
        // Cell (0,0) has paletteIndex 0 — wrong colour
        session.tap(col: 0, row: 0)
        XCTAssertFalse(session.grid.cell(col: 0, row: 0).painted)
    }

    // MARK: - Drag

    func testDragPaintsCorrectCells() {
        let session = makeSession(cols: 4, rows: 1)
        session.selectedPaletteIndex = 0
        // Cells 0,2 have paletteIndex 0; cells 1,3 have paletteIndex 1
        session.dragBegan()
        session.dragMoved(col: 0, row: 0)
        session.dragMoved(col: 2, row: 0)
        session.dragEnded()
        XCTAssertTrue(session.grid.cell(col: 0, row: 0).painted)
        XCTAssertTrue(session.grid.cell(col: 2, row: 0).painted)
        XCTAssertFalse(session.grid.cell(col: 1, row: 0).painted, "Wrong-colour cell should not be painted")
    }

    func testDragDoesNotRepaintInSameGesture() {
        let session = makeSession(cols: 4, rows: 1)
        session.selectedPaletteIndex = 0
        session.dragBegan()
        session.dragMoved(col: 0, row: 0)
        session.dragMoved(col: 0, row: 0)  // same cell again
        session.dragEnded()
        let countAfter = session.grid.unpaintedPerColour[0]
        // Should have painted exactly 1 cell of colour 0 (not double-counted)
        XCTAssertEqual(countAfter, session.totalCells(forIndex: 0) - 1)
    }

    // MARK: - Undo

    func testUndoRevertsLastTap() {
        let session = makeSession()
        session.selectedPaletteIndex = 0
        session.tap(col: 0, row: 0)
        XCTAssertTrue(session.grid.cell(col: 0, row: 0).painted)
        session.undo()
        XCTAssertFalse(session.grid.cell(col: 0, row: 0).painted)
    }

    func testUndoRevertsLastDrag() {
        let session = makeSession(cols: 4, rows: 1)
        session.selectedPaletteIndex = 0
        session.dragBegan()
        session.dragMoved(col: 0, row: 0)
        session.dragMoved(col: 2, row: 0)
        session.dragEnded()
        session.undo()
        XCTAssertFalse(session.grid.cell(col: 0, row: 0).painted)
        XCTAssertFalse(session.grid.cell(col: 2, row: 0).painted)
    }

    func testUndoOnEmptyStack() {
        let session = makeSession()
        let countBefore = session.grid.unpaintedCount
        session.undo()  // must not crash
        XCTAssertEqual(session.grid.unpaintedCount, countBefore)
    }

    // MARK: - Auto-advance

    func testAutoAdvanceOnCompletion() {
        // 2x1 grid: col0=index0, col1=index1
        let session = makeSession(cols: 2, rows: 1, colours: 2)
        session.selectedPaletteIndex = 0
        // Fill the only colour-0 cell
        session.tap(col: 0, row: 0)
        // Auto-advance should move to colour 1
        XCTAssertEqual(session.selectedPaletteIndex, 1)
    }

    // MARK: - Completion

    func testIsCompleteTransition() {
        let session = makeSession(cols: 2, rows: 1, colours: 2)
        session.selectedPaletteIndex = 0
        session.tap(col: 0, row: 0)
        session.selectedPaletteIndex = 1
        session.tap(col: 1, row: 0)
        XCTAssertTrue(session.isComplete)
    }

    // MARK: - Bucket fill

    func testBucketFillConnectedRegion() {
        // 3x1 grid all colour 0 — all 3 cells are connected
        let cells = [GridCell(paletteIndex: 0, painted: false),
                     GridCell(paletteIndex: 0, painted: false),
                     GridCell(paletteIndex: 0, painted: false)]
        let palette = Palette(
            colours: [PaletteColour(rgba: RGBA8(r: 255, g: 0, b: 0), number: 1)],
            originalColours: [PaletteColour(rgba: RGBA8(r: 255, g: 0, b: 0), number: 1)]
        )
        let grid = PixelGrid(columns: 3, rows: 1, cells: cells)
        let artwork = Artwork(id: UUID(), title: "T", bundledImageName: "t",
                              grid: grid, palette: palette,
                              conversionSettings: ConversionSettings.make(sliderValue: 0),
                              createdAt: Date(), lastModifiedAt: Date(), isComplete: false)
        let session = PaintingSession(artwork: artwork)
        session.selectedPaletteIndex = 0
        session.bucketFill(col: 1, row: 0)
        XCTAssertTrue(session.grid.isComplete)
    }

    func testBucketFillDoesNotCrossColourBoundary() {
        // 3x1 grid: [0, 1, 0] — bucket from col 0 should only fill col 0
        let cells = [GridCell(paletteIndex: 0, painted: false),
                     GridCell(paletteIndex: 1, painted: false),
                     GridCell(paletteIndex: 0, painted: false)]
        let palette = Palette(
            colours: [
                PaletteColour(rgba: RGBA8(r: 255, g: 0, b: 0), number: 1),
                PaletteColour(rgba: RGBA8(r: 0, g: 0, b: 255), number: 2)
            ],
            originalColours: [
                PaletteColour(rgba: RGBA8(r: 255, g: 0, b: 0), number: 1),
                PaletteColour(rgba: RGBA8(r: 0, g: 0, b: 255), number: 2)
            ]
        )
        let grid = PixelGrid(columns: 3, rows: 1, cells: cells)
        let artwork = Artwork(id: UUID(), title: "T", bundledImageName: "t",
                              grid: grid, palette: palette,
                              conversionSettings: ConversionSettings.make(sliderValue: 0),
                              createdAt: Date(), lastModifiedAt: Date(), isComplete: false)
        let session = PaintingSession(artwork: artwork)
        session.selectedPaletteIndex = 0
        session.bucketFill(col: 0, row: 0)
        XCTAssertTrue(session.grid.cell(col: 0, row: 0).painted)
        XCTAssertFalse(session.grid.cell(col: 1, row: 0).painted)
        XCTAssertFalse(session.grid.cell(col: 2, row: 0).painted, "col 2 is disconnected from col 0")
    }

    // MARK: - Fill all of number

    func testFillAllOfNumber() {
        let session = makeSession(cols: 4, rows: 1, colours: 2)
        session.selectedPaletteIndex = 0
        session.fillAllOfNumber()
        // All colour-0 cells (cols 0, 2) should be painted
        XCTAssertTrue(session.grid.cell(col: 0, row: 0).painted)
        XCTAssertTrue(session.grid.cell(col: 2, row: 0).painted)
        // Colour-1 cells untouched
        XCTAssertFalse(session.grid.cell(col: 1, row: 0).painted)
        XCTAssertFalse(session.grid.cell(col: 3, row: 0).painted)
    }
}
