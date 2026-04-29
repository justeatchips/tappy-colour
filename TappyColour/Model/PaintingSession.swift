import Foundation
import SwiftUI
import Combine

@MainActor
final class PaintingSession: ObservableObject {

    @Published private(set) var grid: PixelGrid
    @Published private(set) var palette: Palette
    @Published var selectedPaletteIndex: Int
    @Published private(set) var isComplete: Bool = false
    @Published var numbersVisible: Bool = true

    // Single-step undo: stores the (col, row) pairs changed by the last action
    private var undoStack: [[(col: Int, row: Int)]] = []   // max 1 entry

    // Tracks cells painted in the current drag gesture to avoid repainting
    private var currentDragPainted: Set<CellCoord> = []
    private var isDragging: Bool = false

    // Cache: total cells per palette index (constant after conversion)
    private let totalCellsPerColour: [Int]

    let artworkID: UUID

    // Injected save callback — called after every mutating action
    var onNeedsSave: ((PaintingSession) -> Void)?

    init(artwork: Artwork) {
        self.artworkID = artwork.id
        self.grid = artwork.grid
        self.palette = artwork.palette
        // Start on the first incomplete colour
        self.selectedPaletteIndex = (0..<artwork.palette.colours.count)
            .first(where: { artwork.grid.unpaintedPerColour[$0] > 0 }) ?? 0

        // Compute total cells per colour (constant)
        var totals = [Int](repeating: 0, count: artwork.palette.colours.count)
        for cell in artwork.grid.cells {
            let idx = Int(cell.paletteIndex)
            if idx < totals.count { totals[idx] += 1 }
        }
        self.totalCellsPerColour = totals
    }

    // MARK: - Query helpers for PaletteStripView

    func totalCells(forIndex index: Int) -> Int {
        guard index < totalCellsPerColour.count else { return 0 }
        return totalCellsPerColour[index]
    }

    func paintedCells(forIndex index: Int) -> Int {
        guard index < totalCellsPerColour.count,
              index < grid.unpaintedPerColour.count else { return 0 }
        return totalCellsPerColour[index] - grid.unpaintedPerColour[index]
    }

    // MARK: - Painting tools

    func tap(col: Int, row: Int) {
        // Only paint if the cell's colour matches the selected colour
        let cell = grid.cell(col: col, row: row)
        guard Int(cell.paletteIndex) == selectedPaletteIndex, !cell.painted else { return }

        if grid.paint(col: col, row: row) {
            undoStack = [[(col: col, row: row)]]
            afterPaint()
        }
    }

    func dragBegan() {
        isDragging = true
        currentDragPainted.removeAll()
    }

    func dragMoved(col: Int, row: Int) {
        guard isDragging else { return }
        let coord = CellCoord(col: col, row: row)
        guard !currentDragPainted.contains(coord) else { return }

        let cell = grid.cell(col: col, row: row)
        guard Int(cell.paletteIndex) == selectedPaletteIndex, !cell.painted else { return }

        if grid.paint(col: col, row: row) {
            currentDragPainted.insert(coord)
        }
    }

    func dragEnded() {
        isDragging = false
        if !currentDragPainted.isEmpty {
            let changed = currentDragPainted.map { (col: $0.col, row: $0.row) }
            undoStack = [changed]
            currentDragPainted.removeAll()
            afterPaint()
        }
    }

    func bucketFill(col: Int, row: Int) {
        let targetCell = grid.cell(col: col, row: row)
        guard Int(targetCell.paletteIndex) == selectedPaletteIndex,
              !targetCell.painted else { return }

        let region = connectedRegion(startCol: col, startRow: row, paletteIndex: targetCell.paletteIndex)
        let changed = grid.paintCells(region)
        if !changed.isEmpty {
            undoStack = [changed]
            afterPaint()
        }
    }

    func fillAllOfNumber() {
        let indices = grid.unpaintedIndices(forPaletteIndex: UInt8(selectedPaletteIndex))
        let coords = indices.map { idx -> (col: Int, row: Int) in
            (col: idx % grid.columns, row: idx / grid.columns)
        }
        let changed = grid.paintCells(coords)
        if !changed.isEmpty {
            undoStack = [changed]
            afterPaint()
        }
    }

    // MARK: - Undo

    func undo() {
        guard !isDragging, let last = undoStack.last else { return }
        grid.unpaintCells(last)
        undoStack.removeLast()
        isComplete = false
        numbersVisible = true
        onNeedsSave?(self)
    }

    // MARK: - Palette editing

    func replacePaletteColour(at index: Int, with rgba: RGBA8) {
        palette.replaceColour(at: index, with: rgba)
        onNeedsSave?(self)
    }

    func resetPalette() {
        palette.reset()
        onNeedsSave?(self)
    }

    // MARK: - Private helpers

    private func afterPaint() {
        autoAdvanceIfNeeded()
        checkAndHandleCompletion()
        onNeedsSave?(self)
    }

    private func autoAdvanceIfNeeded() {
        guard selectedPaletteIndex < grid.unpaintedPerColour.count,
              grid.unpaintedPerColour[selectedPaletteIndex] == 0 else { return }

        let count = palette.colours.count
        let next = (1..<count)
            .map { (selectedPaletteIndex + $0) % count }
            .first(where: { $0 < grid.unpaintedPerColour.count && grid.unpaintedPerColour[$0] > 0 })
        if let next { selectedPaletteIndex = next }
    }

    private func checkAndHandleCompletion() {
        guard grid.isComplete, !isComplete else { return }
        isComplete = true
        Task { @MainActor in
            try? await Task.sleep(nanoseconds: 500_000_000)
            withAnimation(.easeOut(duration: 0.8)) {
                numbersVisible = false
            }
        }
    }

    private func connectedRegion(startCol: Int, startRow: Int, paletteIndex: UInt8) -> [(col: Int, row: Int)] {
        var queue: [(Int, Int)] = [(startCol, startRow)]
        var visited = Set<CellCoord>()
        var result: [(col: Int, row: Int)] = []

        while !queue.isEmpty {
            let (c, r) = queue.removeFirst()
            guard c >= 0, c < grid.columns, r >= 0, r < grid.rows else { continue }
            let coord = CellCoord(col: c, row: r)
            guard !visited.contains(coord) else { continue }
            let cell = grid.cell(col: c, row: r)
            guard cell.paletteIndex == paletteIndex, !cell.painted else { continue }

            visited.insert(coord)
            result.append((col: c, row: r))
            queue.append(contentsOf: [(c+1, r), (c-1, r), (c, r+1), (c, r-1)])
        }
        return result
    }
}

// MARK: - Supporting types

private struct CellCoord: Hashable {
    let col: Int
    let row: Int
}
