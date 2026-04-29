import XCTest
@testable import TappyColour

final class PixelGridTests: XCTestCase {

    // MARK: - Helpers

    private func makeGrid(cols: Int, rows: Int, paletteIndices: [UInt8]) -> PixelGrid {
        let cells = paletteIndices.map { GridCell(paletteIndex: $0, painted: false) }
        return PixelGrid(columns: cols, rows: rows, cells: cells)
    }

    // MARK: - Tests

    func testInitialUnpaintedCount() {
        let grid = makeGrid(cols: 3, rows: 3, paletteIndices: Array(repeating: 0, count: 9))
        XCTAssertEqual(grid.unpaintedCount, 9)
    }

    func testPaintDecrementCount() {
        var grid = makeGrid(cols: 3, rows: 3, paletteIndices: Array(repeating: 0, count: 9))
        let changed = grid.paint(col: 0, row: 0)
        XCTAssertTrue(changed)
        XCTAssertEqual(grid.unpaintedCount, 8)
    }

    func testPaintIdempotency() {
        var grid = makeGrid(cols: 3, rows: 3, paletteIndices: Array(repeating: 0, count: 9))
        _ = grid.paint(col: 0, row: 0)
        let changed = grid.paint(col: 0, row: 0)
        XCTAssertFalse(changed)
        XCTAssertEqual(grid.unpaintedCount, 8)
    }

    func testUnpaintedPerColourInit() {
        // 2 cells index 0, 1 cell index 1
        let grid = makeGrid(cols: 3, rows: 1, paletteIndices: [0, 0, 1])
        XCTAssertEqual(grid.unpaintedPerColour[0], 2)
        XCTAssertEqual(grid.unpaintedPerColour[1], 1)
    }

    func testUnpaintedPerColourDecrement() {
        var grid = makeGrid(cols: 3, rows: 1, paletteIndices: [0, 0, 1])
        _ = grid.paint(col: 2, row: 0)  // paletteIndex == 1
        XCTAssertEqual(grid.unpaintedPerColour[0], 2, "index 0 should be unchanged")
        XCTAssertEqual(grid.unpaintedPerColour[1], 0, "index 1 should be decremented to 0")
    }

    func testIsCompleteOnlyWhenFullyPainted() {
        var grid = makeGrid(cols: 2, rows: 2, paletteIndices: Array(repeating: 0, count: 4))
        XCTAssertFalse(grid.isComplete)
        _ = grid.paint(col: 0, row: 0)
        _ = grid.paint(col: 1, row: 0)
        _ = grid.paint(col: 0, row: 1)
        XCTAssertFalse(grid.isComplete)
        _ = grid.paint(col: 1, row: 1)
        XCTAssertTrue(grid.isComplete)
    }

    func testUnpaintCells() {
        var grid = makeGrid(cols: 2, rows: 2, paletteIndices: [0, 0, 1, 1])
        _ = grid.paint(col: 0, row: 0)
        _ = grid.paint(col: 1, row: 0)
        XCTAssertEqual(grid.unpaintedCount, 2)
        grid.unpaintCells([(col: 0, row: 0), (col: 1, row: 0)])
        XCTAssertEqual(grid.unpaintedCount, 4)
        XCTAssertEqual(grid.unpaintedPerColour[0], 2)
    }

    func testPaintCellsReturnsDiff() {
        var grid = makeGrid(cols: 3, rows: 1, paletteIndices: [0, 0, 0])
        _ = grid.paint(col: 0, row: 0)  // pre-paint cell 0
        let changed = grid.paintCells([(col: 0, row: 0), (col: 1, row: 0), (col: 2, row: 0)])
        // cell 0 was already painted → only cells 1 and 2 should be returned
        XCTAssertEqual(changed.count, 2)
        let cols = Set(changed.map { $0.col })
        XCTAssertEqual(cols, [1, 2])
    }

    func testUnpaintedIndicesForPaletteIndex() {
        var grid = makeGrid(cols: 4, rows: 1, paletteIndices: [0, 1, 0, 1])
        _ = grid.paint(col: 0, row: 0)  // paint first index-0 cell
        let indices = grid.unpaintedIndices(forPaletteIndex: 0)
        // Remaining unpainted index-0 cell is at flat index 2 (col 2, row 0)
        XCTAssertEqual(indices, [2])
    }
}
