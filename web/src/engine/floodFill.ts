import type { CellCoord } from './types'
import type { PixelGrid } from './PixelGrid'

/**
 * Returns the 4-connected region of unpainted cells sharing the same paletteIndex
 * as the start cell. Returns [] if the start cell is already painted or OOB.
 * Does NOT mutate the grid — caller passes result to grid.paintCells().
 */
export function floodFillRegion(grid: PixelGrid, col: number, row: number): CellCoord[] {
  if (col < 0 || col >= grid.columns || row < 0 || row >= grid.rows) return []

  const startCell = grid.cell(col, row)
  if (startCell.painted) return []

  const targetIndex = startCell.paletteIndex
  const { columns, rows } = grid
  const visited = new Uint8Array(columns * rows)
  const result: CellCoord[] = []
  const stack: number[] = [row * columns + col]

  while (stack.length > 0) {
    const flat = stack.pop()!
    if (visited[flat]) continue
    visited[flat] = 1

    const c = flat % columns
    const r = Math.floor(flat / columns)
    const cell = grid.cell(c, r)

    if (cell.painted || cell.paletteIndex !== targetIndex) continue

    result.push({ col: c, row: r })

    if (c + 1 < columns) stack.push(flat + 1)
    if (c - 1 >= 0)      stack.push(flat - 1)
    if (r + 1 < rows)    stack.push(flat + columns)
    if (r - 1 >= 0)      stack.push(flat - columns)
  }

  return result
}

/**
 * Returns all unpainted cells for a given paletteIndex across the whole grid.
 * Does NOT mutate the grid.
 */
export function cellsForNumber(grid: PixelGrid, paletteIndex: number): CellCoord[] {
  const flatIndices = grid.unpaintedIndicesForPaletteIndex(paletteIndex)
  return flatIndices.map(flat => ({
    col: flat % grid.columns,
    row: Math.floor(flat / grid.columns),
  }))
}
