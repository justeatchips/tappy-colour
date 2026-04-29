import XCTest

final class PaintingSessionTests: XCTestCase {

    func makeSession(cols: Int = 3, rows: Int = 3, colours: Int = 2) -> PaintingSession {
        let cells = (0..<cols*rows).map { i in
            GridCell(paletteIndex: UInt8(i % colours), painted: false)
        }
        let paletteColours = (0..<colours).map { i in
            PaletteColour(rgba: RGBA8(r: UInt8(i*50), g: 0, b: 0), number: i+1)
        }
        let grid = PixelGrid(columns: cols, rows: rows, cells: cells)
        let palette = Palette(colours: paletteColours, originalColours: paletteColours)
        let settings = ConversionSettings.make(sliderValue: 0.0)
        let artwork = Artwork(
            id: UUID(),
            title: "Test",
            bundledImageName: "test",
            grid: grid,
            palette: palette,
            conversionSettings: settings,
            createdAt: Date(),
            lastModifiedAt: Date(),
            isComplete: false
        )
        return PaintingSession(artwork: artwork)
    }

    func testTapPaintsCorrectCell() async {
        let session = makeSession()

        await MainActor.run {
            session.tap(col: 0, row: 0)
        }

        let cell = session.grid.cell(col: 0, row: 0)
        XCTAssertTrue(cell.painted)
    }

    func testTapWrongColourIsNoOp() async {
        let session = makeSession()

        await MainActor.run {
            session.selectedPaletteIndex = 1
            session.tap(col: 0, row: 0)
        }

        let cell = session.grid.cell(col: 0, row: 0)
        XCTAssertFalse(cell.painted)
    }

    func testDragPaintsCorrectCells() async {
        let session = makeSession()

        await MainActor.run {
            session.dragBegan()
            session.dragMoved(col: 0, row: 0)
            session.dragMoved(col: 2, row: 0)
            session.dragEnded()
        }

        let cell1 = session.grid.cell(col: 0, row: 0)
        let cell2 = session.grid.cell(col: 2, row: 0)

        XCTAssertTrue(cell1.painted)
        XCTAssertTrue(cell2.painted)
    }

    func testDragDoesNotRepaintInSameGesture() async {
        let session = makeSession()

        await MainActor.run {
            session.dragBegan()
            session.dragMoved(col: 0, row: 0)
            let countAfterFirstMove = session.grid.unpaintedCount

            session.dragMoved(col: 0, row: 0)
            let countAfterSecondMove = session.grid.unpaintedCount

            session.dragEnded()

            XCTAssertEqual(countAfterFirstMove, countAfterSecondMove)
        }
    }

    func testUndoRevertsLastTap() async {
        let session = makeSession()

        await MainActor.run {
            session.tap(col: 0, row: 0)
            let countAfterTap = session.grid.unpaintedCount

            session.undo()
            let countAfterUndo = session.grid.unpaintedCount

            XCTAssertEqual(countAfterTap, session.grid.columns * session.grid.rows - 1)
            XCTAssertEqual(countAfterUndo, session.grid.columns * session.grid.rows)
        }
    }

    func testUndoRevertsLastDrag() async {
        let session = makeSession()

        await MainActor.run {
            session.dragBegan()
            session.dragMoved(col: 0, row: 0)
            session.dragMoved(col: 1, row: 0)
            session.dragEnded()

            let countAfterDrag = session.grid.unpaintedCount

            session.undo()
            let countAfterUndo = session.grid.unpaintedCount

            XCTAssertEqual(countAfterDrag, session.grid.columns * session.grid.rows - 2)
            XCTAssertEqual(countAfterUndo, session.grid.columns * session.grid.rows)
        }
    }

    func testUndoOnEmptyStack() async {
        let session = makeSession()

        await MainActor.run {
            let countBefore = session.grid.unpaintedCount
            session.undo()
            let countAfter = session.grid.unpaintedCount

            XCTAssertEqual(countBefore, countAfter)
        }
    }

    func testAutoAdvanceOnCompletion() async {
        let session = makeSession(cols: 2, rows: 2, colours: 2)

        await MainActor.run {
            XCTAssertEqual(session.selectedPaletteIndex, 0)

            session.tap(col: 0, row: 0)
            session.tap(col: 0, row: 1)

            XCTAssertEqual(session.selectedPaletteIndex, 1)
        }
    }

    func testIsCompleteTransition() async {
        let session = makeSession(cols: 2, rows: 2, colours: 2)

        await MainActor.run {
            XCTAssertFalse(session.isComplete)

            for col in 0..<2 {
                for row in 0..<2 {
                    session.selectedPaletteIndex = Int(session.grid.cell(col: col, row: row).paletteIndex)
                    session.tap(col: col, row: row)
                }
            }

            XCTAssertTrue(session.isComplete)
        }
    }

    func testBucketFillConnectedRegion() async {
        var cells: [GridCell] = []
        cells.append(GridCell(paletteIndex: 0, painted: false))
        cells.append(GridCell(paletteIndex: 0, painted: false))
        cells.append(GridCell(paletteIndex: 0, painted: false))
        cells.append(GridCell(paletteIndex: 1, painted: false))

        let grid = PixelGrid(columns: 4, rows: 1, cells: cells)
        let palette = Palette(
            colours: [
                PaletteColour(rgba: RGBA8(r: 255, g: 0, b: 0), number: 1),
                PaletteColour(rgba: RGBA8(r: 0, g: 255, b: 0), number: 2)
            ],
            originalColours: [
                PaletteColour(rgba: RGBA8(r: 255, g: 0, b: 0), number: 1),
                PaletteColour(rgba: RGBA8(r: 0, g: 255, b: 0), number: 2)
            ]
        )
        let artwork = Artwork(
            id: UUID(),
            title: "Test",
            bundledImageName: "test",
            grid: grid,
            palette: palette,
            conversionSettings: ConversionSettings.make(sliderValue: 0.0),
            createdAt: Date(),
            lastModifiedAt: Date(),
            isComplete: false
        )
        let session = PaintingSession(artwork: artwork)

        await MainActor.run {
            session.selectedPaletteIndex = 0
            session.bucketFill(col: 0, row: 0)

            XCTAssertTrue(session.grid.cell(col: 0, row: 0).painted)
            XCTAssertTrue(session.grid.cell(col: 1, row: 0).painted)
            XCTAssertTrue(session.grid.cell(col: 2, row: 0).painted)
            XCTAssertFalse(session.grid.cell(col: 3, row: 0).painted)
        }
    }

    func testBucketFillDoesNotCrossColourBoundary() async {
        var cells: [GridCell] = []
        cells.append(GridCell(paletteIndex: 0, painted: false))
        cells.append(GridCell(paletteIndex: 1, painted: false))
        cells.append(GridCell(paletteIndex: 0, painted: false))

        let grid = PixelGrid(columns: 3, rows: 1, cells: cells)
        let palette = Palette(
            colours: [
                PaletteColour(rgba: RGBA8(r: 255, g: 0, b: 0), number: 1),
                PaletteColour(rgba: RGBA8(r: 0, g: 255, b: 0), number: 2)
            ],
            originalColours: [
                PaletteColour(rgba: RGBA8(r: 255, g: 0, b: 0), number: 1),
                PaletteColour(rgba: RGBA8(r: 0, g: 255, b: 0), number: 2)
            ]
        )
        let artwork = Artwork(
            id: UUID(),
            title: "Test",
            bundledImageName: "test",
            grid: grid,
            palette: palette,
            conversionSettings: ConversionSettings.make(sliderValue: 0.0),
            createdAt: Date(),
            lastModifiedAt: Date(),
            isComplete: false
        )
        let session = PaintingSession(artwork: artwork)

        await MainActor.run {
            session.selectedPaletteIndex = 0
            session.bucketFill(col: 0, row: 0)

            XCTAssertTrue(session.grid.cell(col: 0, row: 0).painted)
            XCTAssertFalse(session.grid.cell(col: 1, row: 0).painted)
            XCTAssertFalse(session.grid.cell(col: 2, row: 0).painted)
        }
    }

    func testFillAllOfNumber() async {
        let session = makeSession(cols: 3, rows: 3, colours: 2)

        await MainActor.run {
            session.selectedPaletteIndex = 0
            session.fillAllOfNumber()

            for row in 0..<3 {
                for col in 0..<3 {
                    if (row * 3 + col) % 2 == 0 {
                        XCTAssertTrue(session.grid.cell(col: col, row: row).painted)
                    }
                }
            }
        }
    }
}
