import type { CellCoord } from './types'

export class PixelGrid {
  readonly columns: number
  readonly rows: number
  readonly paletteSize: number

  private paletteIndices: Uint8Array
  private painted: Uint8Array
  private _unpaintedCount: number
  private _unpaintedPerColour: Int32Array

  private constructor(
    columns: number,
    rows: number,
    paletteIndices: Uint8Array,
    paletteSize: number,
    painted: Uint8Array,
    unpaintedPerColour: Int32Array
  ) {
    this.columns = columns
    this.rows = rows
    this.paletteIndices = paletteIndices
    this.paletteSize = paletteSize
    this.painted = painted
    this._unpaintedPerColour = unpaintedPerColour

    let count = 0
    for (let i = 0; i < unpaintedPerColour.length; i++) {
      count += unpaintedPerColour[i]
    }
    this._unpaintedCount = count
  }

  static create(columns: number, rows: number, paletteIndices: Uint8Array, paletteSize: number): PixelGrid {
    const totalCells = columns * rows
    const painted = new Uint8Array(totalCells)
    const unpaintedPerColour = new Int32Array(paletteSize)

    for (let i = 0; i < totalCells; i++) {
      const idx = paletteIndices[i]
      if (idx < paletteSize) {
        unpaintedPerColour[idx]++
      }
    }

    return new PixelGrid(columns, rows, paletteIndices, paletteSize, painted, unpaintedPerColour)
  }

  private isInBounds(col: number, row: number): boolean {
    return col >= 0 && col < this.columns && row >= 0 && row < this.rows
  }

  paint(col: number, row: number): boolean {
    if (!this.isInBounds(col, row)) {
      return false
    }

    const flatIdx = row * this.columns + col
    if (this.painted[flatIdx]) {
      return false
    }

    this.painted[flatIdx] = 1
    const paletteIdx = this.paletteIndices[flatIdx]
    if (paletteIdx < this.paletteSize) {
      this._unpaintedPerColour[paletteIdx]--
      this._unpaintedCount--
    }

    return true
  }

  paintCells(coords: CellCoord[]): CellCoord[] {
    const newlyPainted: CellCoord[] = []
    for (const { col, row } of coords) {
      if (this.paint(col, row)) {
        newlyPainted.push({ col, row })
      }
    }
    return newlyPainted
  }

  unpaintCells(coords: CellCoord[]): void {
    for (const { col, row } of coords) {
      if (!this.isInBounds(col, row)) continue

      const flatIdx = row * this.columns + col
      if (this.painted[flatIdx]) {
        this.painted[flatIdx] = 0
        const paletteIdx = this.paletteIndices[flatIdx]
        if (paletteIdx < this.paletteSize) {
          this._unpaintedPerColour[paletteIdx]++
          this._unpaintedCount++
        }
      }
    }
  }

  isComplete(): boolean {
    return this._unpaintedCount === 0
  }

  cell(col: number, row: number): { paletteIndex: number; painted: boolean } {
    if (!this.isInBounds(col, row)) {
      return { paletteIndex: 0, painted: false }
    }

    const flatIdx = row * this.columns + col
    return {
      paletteIndex: this.paletteIndices[flatIdx],
      painted: this.painted[flatIdx] !== 0
    }
  }

  unpaintedIndicesForPaletteIndex(index: number): number[] {
    const result: number[] = []
    for (let i = 0; i < this.paletteIndices.length; i++) {
      if (this.paletteIndices[i] === index && !this.painted[i]) {
        result.push(i)
      }
    }
    return result
  }

  toPaintStateBytes(): Uint8Array {
    const bytes = new Uint8Array(this.painted.length)
    for (let i = 0; i < this.painted.length; i++) {
      const paletteIdx = this.paletteIndices[i]
      bytes[i] = (this.painted[i] ? 0x80 : 0) | (paletteIdx & 0x7f)
    }
    return bytes
  }

  static fromPaintStateBytes(
    bytes: Uint8Array,
    columns: number,
    rows: number,
    paletteSize: number
  ): PixelGrid {
    const totalCells = columns * rows
    const paletteIndices = new Uint8Array(totalCells)
    const painted = new Uint8Array(totalCells)
    const unpaintedPerColour = new Int32Array(paletteSize)

    for (let i = 0; i < Math.min(bytes.length, totalCells); i++) {
      const byte = bytes[i]
      painted[i] = byte & 0x80 ? 1 : 0
      paletteIndices[i] = byte & 0x7f
      if (!painted[i] && paletteIndices[i] < paletteSize) {
        unpaintedPerColour[paletteIndices[i]]++
      }
    }

    return new PixelGrid(columns, rows, paletteIndices, paletteSize, painted, unpaintedPerColour)
  }

  get unpaintedCount(): number {
    return this._unpaintedCount
  }

  unpaintedForColour(index: number): number {
    if (index >= 0 && index < this.paletteSize) {
      return this._unpaintedPerColour[index]
    }
    return 0
  }
}
