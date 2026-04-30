import { describe, expect, it } from 'vitest'
import { inactiveCellsForShape, isCellActiveForShape, normaliseCellShape } from '../../src/engine/GridShape'
import { createGridFromConversionOutput } from '../../src/engine/ImageConverter'
import type { ConversionOutput } from '../../src/engine/ImageConverter'

function makeOutput(columns: number, rows: number): ConversionOutput {
  return {
    columns,
    rows,
    paletteIndices: new Uint8Array(columns * rows),
    centroids: [{ r: 255, g: 0, b: 0, a: 255 }],
  }
}

describe('grid shapes', () => {
  it('normalises older and unknown shape values to square', () => {
    expect(normaliseCellShape(undefined)).toBe('square')
    expect(normaliseCellShape('triangle')).toBe('square')
    expect(normaliseCellShape('hexCircle')).toBe('hexCircle')
  })

  it('keeps every square-grid cell active', () => {
    expect(inactiveCellsForShape(4, 4, 'square')).toEqual([])
  })

  it('masks a hex grid into a playable circle', () => {
    expect(isCellActiveForShape(3, 3, 7, 7, 'hexCircle')).toBe(true)
    expect(isCellActiveForShape(0, 0, 7, 7, 'hexCircle')).toBe(false)
    expect(inactiveCellsForShape(7, 7, 'hexCircle').length).toBeGreaterThan(0)
  })

  it('marks hex-circle cells outside the circle as already painted', () => {
    const output = makeOutput(7, 7)
    const grid = createGridFromConversionOutput(output, {
      autoFillEnabled: false,
      cellShape: 'hexCircle',
    })

    expect(grid.cell(0, 0).painted).toBe(true)
    expect(grid.cell(3, 3).painted).toBe(false)
    expect(grid.unpaintedCount).toBeLessThan(49)
  })
})
