import { describe, expect, it } from 'vitest'
import type { ConversionOutput } from '../../src/engine/ImageConverter'
import { createGridFromConversionOutput } from '../../src/engine/ImageConverter'
import { findAutoFillCells } from '../../src/engine/autoFill'

const white = { r: 250, g: 250, b: 248, a: 255 }
const warmWhite = { r: 238, g: 239, b: 236, a: 255 }
const red = { r: 180, g: 30, b: 30, a: 255 }
const blue = { r: 20, g: 80, b: 210, a: 255 }
const green = { r: 20, g: 150, b: 60, a: 255 }

function output(indices: number[], centroids = [white, red, blue, green]): ConversionOutput {
  return {
    paletteIndices: new Uint8Array(indices),
    centroids,
    columns: 5,
    rows: 5,
  }
}

function keys(cells: Array<{ col: number; row: number }>): string[] {
  return cells.map(({ col, row }) => `${col},${row}`).sort()
}

describe('auto-fill background detection', () => {
  it('finds border-connected background cells without filling the subject', () => {
    const cells = findAutoFillCells(output([
      0, 0, 0, 0, 0,
      0, 1, 1, 1, 0,
      0, 1, 1, 1, 0,
      0, 1, 1, 1, 0,
      0, 0, 0, 0, 0,
    ]))

    expect(cells).toHaveLength(16)
    expect(keys(cells)).toContain('0,0')
    expect(keys(cells)).not.toContain('2,2')
  })

  it('treats near-uniform border colours as the same background', () => {
    const cells = findAutoFillCells(output([
      0, 1, 0, 1, 0,
      1, 2, 2, 2, 1,
      0, 2, 2, 2, 0,
      1, 2, 2, 2, 1,
      0, 1, 0, 1, 0,
    ], [white, warmWhite, red]))

    expect(cells).toHaveLength(16)
  })

  it('does not fill when there is no dominant border background', () => {
    const cells = findAutoFillCells(output([
      0, 1, 2, 3, 0,
      1, 2, 2, 2, 1,
      2, 2, 2, 2, 2,
      3, 2, 2, 2, 3,
      0, 1, 2, 3, 0,
    ]))

    expect(cells).toEqual([])
  })

  it('does not auto-complete a fully uniform image', () => {
    const cells = findAutoFillCells(output(new Array(25).fill(0)))

    expect(cells).toEqual([])
  })
})

describe('createGridFromConversionOutput', () => {
  const converted = output([
    0, 0, 0, 0, 0,
    0, 1, 1, 1, 0,
    0, 1, 1, 1, 0,
    0, 1, 1, 1, 0,
    0, 0, 0, 0, 0,
  ])

  it('pre-paints background cells when auto-fill is enabled', () => {
    const grid = createGridFromConversionOutput(converted, { autoFillEnabled: true })

    expect(grid.cell(0, 0).painted).toBe(true)
    expect(grid.cell(2, 2).painted).toBe(false)
    expect(grid.unpaintedCount).toBe(9)
  })

  it('leaves every cell unpainted when auto-fill is disabled', () => {
    const grid = createGridFromConversionOutput(converted, { autoFillEnabled: false })

    expect(grid.cell(0, 0).painted).toBe(false)
    expect(grid.unpaintedCount).toBe(25)
  })
})
