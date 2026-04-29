// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest'
import { PixelGrid } from '../../src/engine/PixelGrid'
import { Palette } from '../../src/engine/Palette'
import type { Artwork } from '../../src/model/Artwork'
import { canPrintColourSheet, createPrintableSheetHtml, printArtworkSheet } from '../../src/util/printSheet'

function makeArtwork(): Artwork {
  const grid = PixelGrid.create(2, 2, new Uint8Array([0, 1, 1, 0]), 2)
  return {
    id: 'print-sheet',
    title: '<Duck & Cat>',
    source: { kind: 'bundled', bundledImageName: 'duck' },
    createdAt: 0,
    lastModifiedAt: 0,
    isComplete: false,
    conversionSettings: { sliderValue: 0, gridSize: 2, paletteSize: 2, autoFillEnabled: true },
    palette: new Palette([
      { number: 1, rgba: { r: 255, g: 0, b: 0, a: 255 } },
      { number: 2, rgba: { r: 0, g: 0, b: 255, a: 255 } },
    ]),
    grid,
  }
}

describe('printSheet', () => {
  it('allows printing untouched and completed puzzles only', () => {
    const untouched = makeArtwork()
    expect(canPrintColourSheet(untouched)).toBe(true)

    const inProgress = makeArtwork()
    inProgress.grid.paint(0, 0)
    expect(canPrintColourSheet(inProgress)).toBe(false)

    const complete = makeArtwork()
    complete.grid.paintCells([
      { col: 0, row: 0 },
      { col: 1, row: 0 },
      { col: 0, row: 1 },
      { col: 1, row: 1 },
    ])
    complete.isComplete = true
    expect(canPrintColourSheet(complete)).toBe(true)
  })

  it('builds escaped printable HTML with grid numbers and palette swatches', () => {
    const html = createPrintableSheetHtml(makeArtwork())

    expect(html).toContain('&lt;Duck &amp; Cat&gt;')
    expect(html.match(/class="cell"/g)).toHaveLength(4)
    expect(html).toContain('>1</span>')
    expect(html).toContain('>2</span>')
    expect(html).toContain('rgba(255, 0, 0, 1)')
    expect(html).toContain('rgba(0, 0, 255, 1)')
  })

  it('clears opener access before writing to the print window', () => {
    const printWindow = {
      opener: window,
      document: {
        write: vi.fn(() => {
          expect(printWindow.opener).toBeNull()
        }),
        close: vi.fn(),
      },
      focus: vi.fn(),
      print: vi.fn(),
    }
    vi.spyOn(window, 'open').mockReturnValue(printWindow as unknown as Window)

    expect(printArtworkSheet(makeArtwork())).toBe(true)

    expect(printWindow.opener).toBeNull()
    expect(printWindow.document.write).toHaveBeenCalledWith(expect.stringContaining('Tappy Colour Sheet'))
    expect(printWindow.print).toHaveBeenCalled()
  })
})
