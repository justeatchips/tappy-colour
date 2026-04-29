import { describe, it, expect } from 'vitest'
import { PixelGrid } from '../../src/engine/PixelGrid'
import { floodFillRegion, cellsForNumber } from '../../src/engine/floodFill'

function makeGrid(cols: number, rows: number, indices: number[]): PixelGrid {
  return PixelGrid.create(cols, rows, new Uint8Array(indices), Math.max(...indices) + 1)
}

describe('floodFillRegion', () => {
  it('returns single cell for isolated cell', () => {
    // 3x1 grid: [1, 2, 1]
    const grid = makeGrid(3, 1, [1, 2, 1])
    const region = floodFillRegion(grid, 0, 0)
    expect(region).toHaveLength(1)
    expect(region[0]).toEqual({ col: 0, row: 0 })
  })

  it('returns all connected cells of same index', () => {
    // 3x1 grid: [1, 1, 1]
    const grid = makeGrid(3, 1, [1, 1, 1])
    const region = floodFillRegion(grid, 1, 0)
    expect(region).toHaveLength(3)
  })

  it('diagonal neighbours are NOT connected (4-connectivity)', () => {
    // 2x2 grid: [1, 2 / 2, 1]
    const grid = makeGrid(2, 2, [1, 2, 2, 1])
    const region = floodFillRegion(grid, 0, 0)
    expect(region).toHaveLength(1)
  })

  it('returns [] for OOB start', () => {
    const grid = makeGrid(3, 1, [1, 1, 1])
    expect(floodFillRegion(grid, -1, 0)).toHaveLength(0)
    expect(floodFillRegion(grid, 3, 0)).toHaveLength(0)
    expect(floodFillRegion(grid, 0, 1)).toHaveLength(0)
  })

  it('returns [] for already-painted start cell', () => {
    const grid = makeGrid(3, 1, [1, 1, 1])
    grid.paint(0, 0)
    expect(floodFillRegion(grid, 0, 0)).toHaveLength(0)
  })

  it('fills palette index 0 because it is the first real colour', () => {
    const grid = makeGrid(3, 1, [0, 0, 1])
    expect(floodFillRegion(grid, 0, 0)).toEqual([
      { col: 0, row: 0 },
      { col: 1, row: 0 },
    ])
  })

  it('stops at already-painted borders', () => {
    // 1x5 grid, all index 1; paint middle cell
    const grid = makeGrid(1, 5, [1, 1, 1, 1, 1])
    grid.paint(0, 2)
    const top = floodFillRegion(grid, 0, 0)
    const bottom = floodFillRegion(grid, 0, 4)
    expect(top).toHaveLength(2)
    expect(bottom).toHaveLength(2)
  })

  it('80×80 worst-case completes quickly', () => {
    const size = 80
    const indices = new Uint8Array(size * size).fill(1)
    const grid = PixelGrid.create(size, size, indices, 2)
    const start = performance.now()
    const region = floodFillRegion(grid, 0, 0)
    const elapsed = performance.now() - start
    expect(region).toHaveLength(size * size)
    expect(elapsed).toBeLessThan(50) // well within 50ms
  })
})

describe('cellsForNumber', () => {
  it('returns all unpainted cells for a paletteIndex', () => {
    const grid = makeGrid(3, 1, [1, 2, 1])
    const cells = cellsForNumber(grid, 1)
    expect(cells).toHaveLength(2)
  })

  it('returns [] when all cells are painted', () => {
    const grid = makeGrid(2, 1, [1, 1])
    grid.paint(0, 0)
    grid.paint(1, 0)
    expect(cellsForNumber(grid, 1)).toHaveLength(0)
  })

  it('count matches unpaintedForColour', () => {
    const grid = makeGrid(4, 1, [1, 2, 1, 2])
    expect(cellsForNumber(grid, 1)).toHaveLength(grid.unpaintedForColour(1))
    expect(cellsForNumber(grid, 2)).toHaveLength(grid.unpaintedForColour(2))
  })
})
