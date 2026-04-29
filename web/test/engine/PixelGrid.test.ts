import { describe, it, expect } from 'vitest'
import { PixelGrid } from '../../src/engine/PixelGrid'

function makeGrid(cols: number, rows: number, paletteSize = 3): PixelGrid {
  // Fill each cell with (i % paletteSize)
  const indices = new Uint8Array(cols * rows)
  for (let i = 0; i < indices.length; i++) indices[i] = i % paletteSize
  return PixelGrid.create(cols, rows, indices, paletteSize)
}

describe('PixelGrid', () => {
  it('starts fully unpainted', () => {
    const grid = makeGrid(4, 4, 2)
    expect(grid.unpaintedCount).toBe(16)
    expect(grid.isComplete()).toBe(false)
  })

  it('paint() returns true for a fresh cell', () => {
    const grid = makeGrid(4, 4)
    expect(grid.paint(0, 0)).toBe(true)
    expect(grid.unpaintedCount).toBe(15)
  })

  it('paint() returns false for an already-painted cell', () => {
    const grid = makeGrid(4, 4)
    grid.paint(1, 1)
    expect(grid.paint(1, 1)).toBe(false)
    expect(grid.unpaintedCount).toBe(15)
  })

  it('paint() returns false out-of-bounds', () => {
    const grid = makeGrid(4, 4)
    expect(grid.paint(10, 10)).toBe(false)
    expect(grid.unpaintedCount).toBe(16)
  })

  it('paint() rejects adjacent out-of-bounds coordinates without wrapping', () => {
    const grid = makeGrid(4, 4)

    expect(grid.paint(4, 0)).toBe(false)
    expect(grid.paint(-1, 1)).toBe(false)

    expect(grid.unpaintedCount).toBe(16)
    expect(grid.cell(0, 1).painted).toBe(false)
    expect(grid.cell(3, 0).painted).toBe(false)
  })

  it('isComplete() when all cells painted', () => {
    const grid = makeGrid(2, 2, 1)
    grid.paint(0, 0)
    grid.paint(1, 0)
    grid.paint(0, 1)
    expect(grid.isComplete()).toBe(false)
    grid.paint(1, 1)
    expect(grid.isComplete()).toBe(true)
  })

  it('unpaintCells() reverses paint', () => {
    const grid = makeGrid(4, 4)
    grid.paint(0, 0)
    grid.paint(1, 0)
    expect(grid.unpaintedCount).toBe(14)
    grid.unpaintCells([{ col: 0, row: 0 }, { col: 1, row: 0 }])
    expect(grid.unpaintedCount).toBe(16)
  })

  it('unpaintCells() ignores adjacent out-of-bounds coordinates without wrapping', () => {
    const grid = makeGrid(4, 4)
    grid.paint(0, 1)
    grid.paint(3, 0)

    grid.unpaintCells([{ col: 4, row: 0 }, { col: -1, row: 1 }])

    expect(grid.cell(0, 1).painted).toBe(true)
    expect(grid.cell(3, 0).painted).toBe(true)
    expect(grid.unpaintedCount).toBe(14)
  })

  it('cell() rejects adjacent out-of-bounds coordinates without wrapping', () => {
    const grid = makeGrid(4, 4)
    grid.paint(0, 1)
    grid.paint(3, 0)

    expect(grid.cell(4, 0)).toEqual({ paletteIndex: 0, painted: false })
    expect(grid.cell(-1, 1)).toEqual({ paletteIndex: 0, painted: false })
  })

  it('toPaintStateBytes / fromPaintStateBytes round-trips', () => {
    const grid = makeGrid(4, 4, 3)
    grid.paint(0, 0)
    grid.paint(3, 3)
    const bytes = grid.toPaintStateBytes()
    const restored = PixelGrid.fromPaintStateBytes(bytes, 4, 4, 3)
    expect(restored.unpaintedCount).toBe(grid.unpaintedCount)
    expect(restored.cell(0, 0).painted).toBe(true)
    expect(restored.cell(3, 3).painted).toBe(true)
    expect(restored.cell(1, 0).painted).toBe(false)
    expect(restored.cell(0, 0).paletteIndex).toBe(grid.cell(0, 0).paletteIndex)
  })

  it('unpaintedForColour tracks counts correctly', () => {
    // 4x4 grid, palette 2: cells 0,2,4,... → index 0; cells 1,3,5,... → index 1
    const grid = makeGrid(4, 4, 2)
    const initialCount0 = grid.unpaintedForColour(0)
    const initialCount1 = grid.unpaintedForColour(1)
    expect(initialCount0 + initialCount1).toBe(16)
    // Paint one cell with index 0 (col=0, row=0 → flat=0 → index 0%2=0)
    grid.paint(0, 0)
    expect(grid.unpaintedForColour(0)).toBe(initialCount0 - 1)
    expect(grid.unpaintedForColour(1)).toBe(initialCount1)
  })
})
