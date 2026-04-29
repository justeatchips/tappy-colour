import type { CellCoord, RGBA8 } from './types'

interface AutoFillInput {
  paletteIndices: Uint8Array
  centroids: RGBA8[]
  columns: number
  rows: number
}

const MIN_BORDER_SHARE = 0.45
const MIN_FILL_SHARE = 0.05
const MAX_FILL_SHARE = 0.9
const NEAR_COLOUR_DISTANCE = 42

function flatIndex(col: number, row: number, columns: number): number {
  return row * columns + col
}

function borderCoords(columns: number, rows: number): CellCoord[] {
  const coords: CellCoord[] = []
  for (let col = 0; col < columns; col++) {
    coords.push({ col, row: 0 })
    if (rows > 1) coords.push({ col, row: rows - 1 })
  }
  for (let row = 1; row < rows - 1; row++) {
    coords.push({ col: 0, row })
    if (columns > 1) coords.push({ col: columns - 1, row })
  }
  return coords
}

function colourDistance(a: RGBA8, b: RGBA8): number {
  const dr = a.r - b.r
  const dg = a.g - b.g
  const db = a.b - b.b
  return Math.sqrt(dr * dr + dg * dg + db * db)
}

function chooseBorderPaletteIndex(input: AutoFillInput, border: CellCoord[]): number | null {
  const counts = new Int32Array(input.centroids.length)
  for (const { col, row } of border) {
    const paletteIndex = input.paletteIndices[flatIndex(col, row, input.columns)]
    if (paletteIndex < counts.length) counts[paletteIndex]++
  }

  let bestIndex = -1
  let bestCount = 0
  for (let i = 0; i < counts.length; i++) {
    if (counts[i] > bestCount) {
      bestIndex = i
      bestCount = counts[i]
    }
  }

  return bestIndex >= 0 && bestCount / border.length >= MIN_BORDER_SHARE ? bestIndex : null
}

export function findAutoFillCells(input: AutoFillInput): CellCoord[] {
  const totalCells = input.columns * input.rows
  if (totalCells === 0 || input.centroids.length === 0) return []

  const border = borderCoords(input.columns, input.rows)
  const backgroundIndex = chooseBorderPaletteIndex(input, border)
  if (backgroundIndex === null) return []

  const backgroundColour = input.centroids[backgroundIndex]
  const fillablePaletteIndices = new Set<number>(
    input.centroids
      .map((colour, index) => ({ colour, index }))
      .filter(({ colour }) => colourDistance(backgroundColour, colour) <= NEAR_COLOUR_DISTANCE)
      .map(({ index }) => index)
  )

  const visited = new Uint8Array(totalCells)
  const filled: CellCoord[] = []
  const queue: CellCoord[] = []

  for (const coord of border) {
    const index = flatIndex(coord.col, coord.row, input.columns)
    const paletteIndex = input.paletteIndices[index]
    if (fillablePaletteIndices.has(paletteIndex)) queue.push(coord)
  }

  for (let cursor = 0; cursor < queue.length; cursor++) {
    const { col, row } = queue[cursor]
    if (col < 0 || col >= input.columns || row < 0 || row >= input.rows) continue

    const index = flatIndex(col, row, input.columns)
    if (visited[index]) continue
    visited[index] = 1

    const paletteIndex = input.paletteIndices[index]
    if (!fillablePaletteIndices.has(paletteIndex)) continue

    filled.push({ col, row })
    queue.push(
      { col: col - 1, row },
      { col: col + 1, row },
      { col, row: row - 1 },
      { col, row: row + 1 }
    )
  }

  const fillShare = filled.length / totalCells
  if (fillShare < MIN_FILL_SHARE || fillShare >= MAX_FILL_SHARE) return []
  return filled
}
