import Foundation

// MARK: - RGBA8
struct RGBA8: Equatable, Hashable, Codable {
    let r: UInt8
    let g: UInt8
    let b: UInt8
    let a: UInt8

    init(r: UInt8, g: UInt8, b: UInt8, a: UInt8 = 255) {
        self.r = r
        self.g = g
        self.b = b
        self.a = a
    }
}

// MARK: - GridCell
struct GridCell: Equatable {
    var paletteIndex: UInt8
    var painted: Bool

    init(paletteIndex: UInt8, painted: Bool) {
        self.paletteIndex = paletteIndex
        self.painted = painted
    }
}

// MARK: - PixelGrid
struct PixelGrid: Equatable {
    let columns: Int
    let rows: Int
    private(set) var cells: [GridCell]
    private(set) var unpaintedCount: Int
    private(set) var unpaintedPerColour: [Int]

    // MARK: Initializer
    init(columns: Int, rows: Int, cells: [GridCell]) {
        self.columns = columns
        self.rows = rows
        self.cells = cells

        var unpaintedCount = 0
        var unpaintedPerColour = [Int](repeating: 0, count: 256)

        for cell in cells {
            if !cell.painted {
                unpaintedCount += 1
                unpaintedPerColour[Int(cell.paletteIndex)] += 1
            }
        }

        self.unpaintedCount = unpaintedCount
        self.unpaintedPerColour = unpaintedPerColour
    }

    // MARK: Painting Operations
    mutating func paint(col: Int, row: Int) -> Bool {
        guard let index = flatIndex(col: col, row: row) else { return false }
        guard !cells[index].painted else { return false }

        cells[index].painted = true
        unpaintedCount -= 1
        unpaintedPerColour[Int(cells[index].paletteIndex)] -= 1
        return true
    }

    mutating func paintCells(_ coords: [(col: Int, row: Int)]) -> [(col: Int, row: Int)] {
        var changed: [(col: Int, row: Int)] = []
        for (col, row) in coords {
            if paint(col: col, row: row) {
                changed.append((col, row))
            }
        }
        return changed
    }

    mutating func unpaintCells(_ coords: [(col: Int, row: Int)]) {
        for (col, row) in coords {
            guard let index = flatIndex(col: col, row: row) else { continue }
            guard cells[index].painted else { continue }

            cells[index].painted = false
            unpaintedCount += 1
            unpaintedPerColour[Int(cells[index].paletteIndex)] += 1
        }
    }

    // MARK: State Queries
    var isComplete: Bool {
        unpaintedCount == 0
    }

    func cell(col: Int, row: Int) -> GridCell {
        guard let index = flatIndex(col: col, row: row) else {
            return GridCell(paletteIndex: 0, painted: true)
        }
        return cells[index]
    }

    func unpaintedIndices(forPaletteIndex paletteIndex: UInt8) -> [Int] {
        var indices: [Int] = []
        let targetIndex = Int(paletteIndex)
        for (flatIdx, cell) in cells.enumerated() {
            if Int(cell.paletteIndex) == targetIndex && !cell.painted {
                indices.append(flatIdx)
            }
        }
        return indices
    }

    // MARK: Private Helpers
    private func flatIndex(col: Int, row: Int) -> Int? {
        guard col >= 0, col < columns, row >= 0, row < rows else { return nil }
        return row * columns + col
    }
}
