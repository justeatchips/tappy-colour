import { EventEmitter } from '../util/events'
import type { PixelGrid } from '../engine/PixelGrid'
import type { Palette } from '../engine/Palette'
import type { RGBA8, CellCoord } from '../engine/types'
import { cellKey } from '../engine/types'
import { floodFillRegion, cellsForNumber } from '../engine/floodFill'
import type { ArtworkStore } from './ArtworkStore'
import type { Artwork } from './Artwork'
import type { PaintTool } from './PaintTool'
export type { PaintTool } from './PaintTool'

export type PaintEventType =
  | 'gridChanged'
  | 'paletteChanged'
  | 'selectionChanged'
  | 'completionChanged'
  | 'numbersVisibilityChanged'
  | 'toolChanged'
  | 'colourCompleted'
  | 'hintRequested'
  | 'wrongCell'

export class PaintingSession extends EventEmitter<{ change: PaintEventType }> {
  readonly artworkID: string
  grid: PixelGrid
  palette: Palette
  selectedPaletteIndex: number
  isComplete = false
  numbersVisible = true
  currentTool: PaintTool = 'tap'
  lastCompletedPaletteIndex: number | null = null
  lastRejectedCell: CellCoord | null = null

  private undoStack: CellCoord[][] = [] // max 1 entry
  private currentDragPainted = new Set<number>() // cellKey values
  private isDragging = false
  private totalCellsPerColour: number[]
  private numbersVisibilityTimeout: ReturnType<typeof setTimeout> | null =
    null
  private originalArtwork: Artwork

  constructor(artwork: Artwork, private store: ArtworkStore) {
    super()

    this.originalArtwork = artwork
    this.artworkID = artwork.id
    this.grid = artwork.grid
    this.palette = artwork.palette
    this.isComplete = artwork.isComplete

    // Compute totalCellsPerColour based on palette size
    this.totalCellsPerColour = new Array(artwork.palette.colours.length).fill(0)

    // Count total cells for each palette index
    for (let col = 0; col < artwork.grid.columns; col++) {
      for (let row = 0; row < artwork.grid.rows; row++) {
        const cell = artwork.grid.cell(col, row)
        if (cell.paletteIndex < this.totalCellsPerColour.length) {
          this.totalCellsPerColour[cell.paletteIndex]++
        }
      }
    }

    this.currentTool = artwork.sessionState?.currentTool ?? 'tap'

    // Find first incomplete colour unless valid persisted state says where the child left off.
    const restoredPaletteIndex = artwork.sessionState?.selectedPaletteIndex
    if (this.validPaletteIndex(restoredPaletteIndex)) {
      this.selectedPaletteIndex = restoredPaletteIndex
      return
    }

    this.selectedPaletteIndex = 0

    for (let i = 0; i < artwork.palette.colours.length; i++) {
      if (artwork.grid.unpaintedForColour(i) > 0) {
        this.selectedPaletteIndex = i
        break
      }
    }
  }

  private validPaletteIndex(index: number | undefined): index is number {
    return index !== undefined && index >= 0 && index < this.palette.colours.length
  }

  /**
   * Get total number of cells for a palette colour.
   */
  totalCells(index: number): number {
    return this.totalCellsPerColour[index] || 0
  }

  /**
   * Get number of painted cells for a palette colour.
   */
  paintedCells(index: number): number {
    const total = this.totalCells(index)
    const unpainted = this.grid.unpaintedForColour(index)
    return total - unpainted
  }

  /**
   * Paint a single cell at (col, row) if it matches selectedPaletteIndex and is unpainted.
   */
  tap(col: number, row: number): void {
    const cell = this.grid.cell(col, row)

    if (cell.paletteIndex !== this.selectedPaletteIndex || cell.painted) {
      if (!cell.painted) this.rejectCell(col, row)
      return
    }

    this.grid.paint(col, row)
    this.undoStack = [[{ col, row }]]
    this.emit('change', 'gridChanged')
    this.afterPaint()
  }

  /**
   * Switch the active painting tool. Aborts any in-progress drag.
   */
  setTool(tool: PaintTool): void {
    if (this.currentTool === tool) return
    this.isDragging = false
    this.currentDragPainted.clear()
    this.currentTool = tool
    this.emit('change', 'toolChanged')
    this.saveToStore()
  }

  requestHint(): void {
    if (this.grid.unpaintedForColour(this.selectedPaletteIndex) === 0) return
    this.emit('change', 'hintRequested')
  }

  private rejectCell(col: number, row: number): void {
    this.lastRejectedCell = { col, row }
    this.emit('change', 'wrongCell')
  }

  /**
   * Switch the selected palette colour and persist the resumed state.
   */
  selectPaletteIndex(index: number): void {
    if (!this.validPaletteIndex(index) || this.selectedPaletteIndex === index) return
    this.selectedPaletteIndex = index
    this.emit('change', 'selectionChanged')
    this.saveToStore()
  }

  /**
   * Flood-fill the 4-connected region at (col, row) if it matches selectedPaletteIndex.
   */
  bucketFill(col: number, row: number): void {
    const cell = this.grid.cell(col, row)
    if (cell.paletteIndex !== this.selectedPaletteIndex || cell.painted) {
      if (!cell.painted) this.rejectCell(col, row)
      return
    }

    const coords = floodFillRegion(this.grid, col, row)
    if (coords.length === 0) return

    const painted = this.grid.paintCells(coords)
    if (painted.length === 0) return

    this.undoStack = [painted]
    this.emit('change', 'gridChanged')
    this.afterPaint()
  }

  /**
   * Fill every remaining cell of the selected palette colour.
   */
  fillAllOfSelected(): void {
    const coords = cellsForNumber(this.grid, this.selectedPaletteIndex)
    if (coords.length === 0) return

    const painted = this.grid.paintCells(coords)
    if (painted.length === 0) return

    this.undoStack = [painted]
    this.emit('change', 'gridChanged')
    this.afterPaint()
  }

  /**
   * Begin a drag operation. Clears the set of painted cells during this drag.
   */
  dragBegan(): void {
    this.isDragging = true
    this.currentDragPainted.clear()
  }

  /**
   * Move during a drag. Paint the cell if it matches selectedPaletteIndex, is unpainted,
   * and hasn't been painted in this drag.
   */
  dragMoved(col: number, row: number): void {
    if (!this.isDragging) return

    const key = cellKey(col, row)

    if (this.currentDragPainted.has(key)) {
      return
    }

    const cell = this.grid.cell(col, row)

    if (cell.paletteIndex !== this.selectedPaletteIndex || cell.painted) {
      return
    }

    this.grid.paint(col, row)
    this.currentDragPainted.add(key)
    this.emit('change', 'gridChanged')
  }

  /**
   * End a drag operation. Convert the painted cells set to coordinates and set undo stack.
   */
  dragEnded(): void {
    this.isDragging = false

    if (this.currentDragPainted.size === 0) {
      return
    }

    // Convert cellKey values back to coordinates
    const coords: CellCoord[] = []
    for (const key of this.currentDragPainted) {
      coords.push({
        col: key % 10000,
        row: Math.floor(key / 10000),
      })
    }

    this.undoStack = [coords]
    this.currentDragPainted.clear()

    this.afterPaint()
  }

  /**
   * Undo the last action.
   */
  undo(): void {
    if (this.isDragging || this.undoStack.length === 0) {
      return
    }

    this.grid.unpaintCells(this.undoStack[0])
    this.undoStack = []
    this.restoreIncompleteState()

    this.emit('change', 'gridChanged')
    this.saveToStore()
  }

  /**
   * Replace a palette colour.
   */
  replacePaletteColour(index: number, rgba: RGBA8): void {
    this.palette.replaceColour(index, rgba)
    this.emit('change', 'paletteChanged')
    this.saveToStore()
  }

  /**
   * Reset palette to original colours.
   */
  resetPalette(): void {
    this.palette.reset()
    this.emit('change', 'paletteChanged')
    this.saveToStore()
  }

  /**
   * Auto-advance to the next incomplete colour if current is complete.
   */
  private autoAdvanceIfNeeded(): void {
    if (this.grid.unpaintedForColour(this.selectedPaletteIndex) > 0) {
      return
    }

    // Find next colour with unpainted cells
    for (let i = this.selectedPaletteIndex + 1; i < this.palette.colours.length; i++) {
      if (this.grid.unpaintedForColour(i) > 0) {
        this.selectedPaletteIndex = i
        this.emit('change', 'selectionChanged')
        return
      }
    }
  }

  /**
   * Check if the grid is complete and handle completion state.
   */
  private checkAndHandleCompletion(): void {
    if (!this.grid.isComplete() || this.isComplete) {
      return
    }

    this.isComplete = true
    this.emit('change', 'completionChanged')

    this.clearNumbersVisibilityTimeout()

    // Delay 500ms, then start fade animation by hiding numbers
    this.numbersVisibilityTimeout = setTimeout(() => {
      this.numbersVisible = false
      this.emit('change', 'numbersVisibilityChanged')
      this.numbersVisibilityTimeout = null
    }, 500)
  }

  /**
   * Called after painting cells. Auto-advances colour, checks completion, and saves.
   */
  private afterPaint(): void {
    this.emitColourCompletedIfNeeded()
    this.autoAdvanceIfNeeded()
    this.checkAndHandleCompletion()
    this.saveToStore()
  }

  private emitColourCompletedIfNeeded(): void {
    if (this.grid.unpaintedForColour(this.selectedPaletteIndex) > 0) return
    if (this.totalCells(this.selectedPaletteIndex) === 0) return

    this.lastCompletedPaletteIndex = this.selectedPaletteIndex
    this.emit('change', 'colourCompleted')
  }

  destroy(): void {
    this.clearNumbersVisibilityTimeout()
  }

  toArtworkSnapshot(now = Date.now()): Artwork {
    return {
      id: this.artworkID,
      title: this.originalArtwork.title,
      source: this.originalArtwork.source,
      thumbnailBlob: this.originalArtwork.thumbnailBlob,
      sourceImageBlob: this.originalArtwork.sourceImageBlob,
      createdAt: this.originalArtwork.createdAt,
      lastModifiedAt: now,
      isComplete: this.isComplete,
      conversionSettings: this.originalArtwork.conversionSettings,
      palette: this.palette,
      grid: this.grid,
      sessionState: {
        currentTool: this.currentTool,
        selectedPaletteIndex: this.selectedPaletteIndex,
      },
    }
  }

  private restoreIncompleteState(): void {
    const wasComplete = this.isComplete
    const numbersWereHidden = !this.numbersVisible

    this.clearNumbersVisibilityTimeout()
    this.isComplete = false
    this.numbersVisible = true

    if (wasComplete) this.emit('change', 'completionChanged')
    if (numbersWereHidden) this.emit('change', 'numbersVisibilityChanged')
  }

  private clearNumbersVisibilityTimeout(): void {
    if (this.numbersVisibilityTimeout !== null) {
      clearTimeout(this.numbersVisibilityTimeout)
      this.numbersVisibilityTimeout = null
    }
  }

  /**
   * Build and save the current state to the artwork store.
   */
  private saveToStore(): void {
    const artwork = this.toArtworkSnapshot()

    this.store.save(artwork).catch(() => {
      // Silently fail on save error
    })
  }
}
