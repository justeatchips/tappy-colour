import type { CellCoord } from './types'

export type CellShape = 'square' | 'hexCircle'

export const DEFAULT_CELL_SHAPE: CellShape = 'square'

const HEX_WIDTH_FACTOR = Math.sqrt(3)

export interface HexLayout {
  radius: number
  hexWidth: number
  hexHeight: number
  verticalStep: number
  width: number
  height: number
}

export function normaliseCellShape(value: unknown): CellShape {
  return value === 'hexCircle' ? 'hexCircle' : DEFAULT_CELL_SHAPE
}

export function hexLayoutFor(columns: number, rows: number, radius = 1): HexLayout {
  const hexWidth = HEX_WIDTH_FACTOR * radius
  const hexHeight = 2 * radius
  const verticalStep = 1.5 * radius

  return {
    radius,
    hexWidth,
    hexHeight,
    verticalStep,
    width: columns > 0 ? hexWidth * (columns + 0.5) : 0,
    height: rows > 0 ? hexHeight + Math.max(0, rows - 1) * verticalStep : 0,
  }
}

export function hexCellCenter(
  col: number,
  row: number,
  layout: Pick<HexLayout, 'hexWidth' | 'verticalStep' | 'radius'>
): { x: number; y: number } {
  return {
    x: layout.hexWidth / 2 + col * layout.hexWidth + (row % 2) * layout.hexWidth / 2,
    y: layout.radius + row * layout.verticalStep,
  }
}

export function isCellActiveForShape(
  col: number,
  row: number,
  columns: number,
  rows: number,
  shape: CellShape | undefined
): boolean {
  if (normaliseCellShape(shape) === 'square') return true

  const layout = hexLayoutFor(columns, rows)
  if (layout.width <= 0 || layout.height <= 0) return false

  const center = hexCellCenter(col, row, layout)
  const circleX = layout.width / 2
  const circleY = layout.height / 2
  const radius = Math.min(layout.width, layout.height) / 2
  const dx = center.x - circleX
  const dy = center.y - circleY

  return dx * dx + dy * dy <= radius * radius
}

export function inactiveCellsForShape(
  columns: number,
  rows: number,
  shape: CellShape | undefined
): CellCoord[] {
  if (normaliseCellShape(shape) === 'square') return []

  const cells: CellCoord[] = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      if (!isCellActiveForShape(col, row, columns, rows, shape)) {
        cells.push({ col, row })
      }
    }
  }
  return cells
}

export function pointInPointyHex(
  x: number,
  y: number,
  centerX: number,
  centerY: number,
  radius: number
): boolean {
  const dx = Math.abs(x - centerX)
  const dy = Math.abs(y - centerY)
  const halfWidth = HEX_WIDTH_FACTOR * radius / 2

  return dy <= radius && dx <= halfWidth && dy + dx / HEX_WIDTH_FACTOR <= radius
}
