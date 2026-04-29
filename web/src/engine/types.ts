export interface RGBA8 {
  r: number  // 0-255
  g: number
  b: number
  a: number
}

export interface GridCell {
  paletteIndex: number
  painted: boolean
}

export interface CellCoord {
  col: number
  row: number
}

export class ConversionError extends Error {
  constructor(
    public readonly code: 'imageTooSmall' | 'quantisationFailed' | 'loadFailed',
    message: string
  ) {
    super(message)
    this.name = 'ConversionError'
  }
}

/** Fast integer key for a cell coordinate — used for Set dedup in drag painting */
export const cellKey = (col: number, row: number): number => row * 10_000 + col

/** Palette colour with RGBA and display number */
export interface PaletteColour {
  rgba: RGBA8
  number: number // 1-based display label
}
