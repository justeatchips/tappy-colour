import XCTest

final class PixelGridTests: XCTestCase {

    func testInitialUnpaintedCount() {
        let cells = (0..<9).map { _ in GridCell(paletteIndex: 0, painted: false) }
        let grid = PixelGrid(columns: 3, rows: 3, cells: cells)

        XCTAssertEqual(grid.unpaintedCount, 9)
    }

    func testPaintDecrementCount() {
        let cells = (0..<9).map { _ in GridCell(paletteIndex: 0, painted: false) }
        var grid = PixelGrid(columns: 3, rows: 3, cells: cells)

        let painted = grid.paint(col: 0, row: 0)
        XCTAssertTrue(painted)
        XCTAssertEqual(grid.unpaintedCount, 8)
    }

    func testPaintIdempotency() {
        let cells = (0..<9).map { _ in GridCell(paletteIndex: 0, painted: false) }
        var grid = PixelGrid(columns: 3, rows: 3, cells: cells)

        _ = grid.paint(col: 0, row: 0)
        let secondPaint = grid.paint(col: 0, row: 0)

        XCTAssertFalse(secondPaint)
        XCTAssertEqual(grid.unpaintedCount, 8)
    }

    func testUnpaintedPerColourInit() {
        var cells: [GridCell] = []
        cells.append(GridCell(paletteIndex: 0, painted: false))
        cells.append(GridCell(paletteIndex: 0, painted: false))
        cells.append(GridCell(paletteIndex: 1, painted: false))

        let grid = PixelGrid(columns: 3, rows: 1, cells: cells)

        XCTAssertEqual(grid.unpaintedPerColour[0], 2)
        XCTAssertEqual(grid.unpaintedPerColour[1], 1)
    }

    func testUnpaintedPerColourDecrement() {
        var cells: [GridCell] = []
        cells.append(GridCell(paletteIndex: 0, painted: false))
        cells.append(GridCell(paletteIndex: 1, painted: false))

        var grid = PixelGrid(columns: 2, rows: 1, cells: cells)

        XCTAssertEqual(grid.unpaintedPerColour[0], 1)
        XCTAssertEqual(grid.unpaintedPerColour[1], 1)

        _ = grid.paint(col: 1, row: 0)

        XCTAssertEqual(grid.unpaintedPerColour[0], 1)
        XCTAssertEqual(grid.unpaintedPerColour[1], 0)
    }

    func testIsCompleteOnlyWhenFullyPainted() {
        let cells = (0..<4).map { _ in GridCell(paletteIndex: 0, painted: false) }
        var grid = PixelGrid(columns: 2, rows: 2, cells: cells)

        XCTAssertFalse(grid.isComplete)

        _ = grid.paint(col: 0, row: 0)
        _ = grid.paint(col: 1, row: 0)
        _ = grid.paint(col: 0, row: 1)

        XCTAssertFalse(grid.isComplete)

        _ = grid.paint(col: 1, row: 1)

        XCTAssertTrue(grid.isComplete)
    }

    func testUnpaintCells() {
        let cells = (0..<4).map { _ in GridCell(paletteIndex: 0, painted: false) }
        var grid = PixelGrid(columns: 2, rows: 2, cells: cells)

        _ = grid.paint(col: 0, row: 0)
        _ = grid.paint(col: 1, row: 0)

        XCTAssertEqual(grid.unpaintedCount, 2)

        grid.unpaintCells([(col: 0, row: 0)])

        XCTAssertEqual(grid.unpaintedCount, 3)
    }

    func testPaintCellsReturnsDiff() {
        let cells = (0..<4).map { _ in GridCell(paletteIndex: 0, painted: false) }
        var grid = PixelGrid(columns: 2, rows: 2, cells: cells)

        let coords = [(col: 0, row: 0), (col: 1, row: 0), (col: 0, row: 0)]
        let changed = grid.paintCells(coords)

        XCTAssertEqual(changed.count, 2)
        XCTAssertTrue(changed.contains { $0.col == 0 && $0.row == 0 })
        XCTAssertTrue(changed.contains { $0.col == 1 && $0.row == 0 })
    }

    func testUnpaintedIndicesForPaletteIndex() {
        var cells: [GridCell] = []
        cells.append(GridCell(paletteIndex: 0, painted: false))
        cells.append(GridCell(paletteIndex: 1, painted: false))
        cells.append(GridCell(paletteIndex: 0, painted: false))
        cells.append(GridCell(paletteIndex: 1, painted: true))

        let grid = PixelGrid(columns: 2, rows: 2, cells: cells)

        let indices0 = grid.unpaintedIndices(forPaletteIndex: 0)
        let indices1 = grid.unpaintedIndices(forPaletteIndex: 1)

        XCTAssertEqual(indices0.count, 2)
        XCTAssertEqual(Set(indices0), [0, 2])
        XCTAssertEqual(indices1.count, 1)
        XCTAssertEqual(Set(indices1), [1])
    }
}
