import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PaintingSession } from '../../src/model/PaintingSession'
import { PixelGrid } from '../../src/engine/PixelGrid'
import { Palette } from '../../src/engine/Palette'
import type { Artwork } from '../../src/model/Artwork'
import type { ArtworkStore } from '../../src/model/ArtworkStore'

function makeArtwork(indices: number[], cols: number, rows: number, overrides: Partial<Artwork> = {}): Artwork {
  const paletteSize = Math.max(...indices) + 1
  const grid = PixelGrid.create(cols, rows, new Uint8Array(indices), paletteSize)
  const colours = Array.from({ length: paletteSize }, (_, i) => ({
    rgba: { r: i * 40, g: 0, b: 0, a: 255 },
    number: i + 1,
  }))
  const palette = new Palette(colours)
  return {
    id: 'test',
    title: 'Test',
    source: { kind: 'bundled', bundledImageName: 'test' },
    createdAt: 0,
    lastModifiedAt: 0,
    isComplete: false,
    conversionSettings: { sliderValue: 0, gridSize: cols, paletteSize, autoFillEnabled: true },
    palette,
    grid,
    ...overrides,
  }
}

function fakeStore(): ArtworkStore {
  return { save: vi.fn().mockResolvedValue(undefined) } as unknown as ArtworkStore
}

describe('PaintingSession — tool modes', () => {
  it('defaults to tap tool', () => {
    const session = new PaintingSession(makeArtwork([1, 2, 1], 3, 1), fakeStore())
    expect(session.currentTool).toBe('tap')
  })

  it('setTool emits toolChanged', () => {
    const session = new PaintingSession(makeArtwork([1, 2, 1], 3, 1), fakeStore())
    const events: string[] = []
    session.on('change', (t) => events.push(t))
    session.setTool('bucket')
    expect(session.currentTool).toBe('bucket')
    expect(events).toContain('toolChanged')
  })

  it('setTool to same tool does not emit', () => {
    const session = new PaintingSession(makeArtwork([1, 2, 1], 3, 1), fakeStore())
    const events: string[] = []
    session.on('change', (t) => events.push(t))
    session.setTool('tap')
    expect(events).toHaveLength(0)
  })

  it('restores persisted tool and palette selection', () => {
    const session = new PaintingSession(
      makeArtwork([0, 1, 2], 3, 1, {
        sessionState: { currentTool: 'bucket', selectedPaletteIndex: 2 },
      }),
      fakeStore()
    )

    expect(session.currentTool).toBe('bucket')
    expect(session.selectedPaletteIndex).toBe(2)
  })

  it('persists tool changes for resume', () => {
    const store = fakeStore()
    const session = new PaintingSession(makeArtwork([0, 1, 2], 3, 1), store)

    session.setTool('fillAll')

    const saved = vi.mocked(store.save).mock.calls[0][0]
    expect(saved.sessionState).toEqual({
      currentTool: 'fillAll',
      selectedPaletteIndex: 0,
    })
  })

  it('persists palette selection changes for resume', () => {
    const store = fakeStore()
    const session = new PaintingSession(makeArtwork([0, 1, 2], 3, 1), store)

    session.selectPaletteIndex(2)

    const saved = vi.mocked(store.save).mock.calls[0][0]
    expect(saved.sessionState).toEqual({
      currentTool: 'tap',
      selectedPaletteIndex: 2,
    })
  })

  it('preserves the source image blob when saving progress', () => {
    const store = fakeStore()
    const sourceImageBlob = new Blob(['source-img'], { type: 'image/jpeg' })
    const session = new PaintingSession(
      makeArtwork([0, 1], 2, 1, { sourceImageBlob }),
      store
    )

    session.selectPaletteIndex(1)

    const saved = vi.mocked(store.save).mock.calls[0][0]
    expect(saved.sourceImageBlob).toBe(sourceImageBlob)
  })

  it('emits wrongCell without painting when a wrong number is tapped', () => {
    const session = new PaintingSession(makeArtwork([0, 1], 2, 1), fakeStore())
    const events: string[] = []
    session.on('change', (t) => events.push(t))

    session.tap(1, 0)

    expect(events).toContain('wrongCell')
    expect(events).not.toContain('gridChanged')
    expect(session.lastRejectedCell).toEqual({ col: 1, row: 0 })
    expect(session.grid.cell(1, 0).painted).toBe(false)
  })
})

describe('PaintingSession — bucketFill', () => {
  let session: PaintingSession

  beforeEach(() => {
    // 3x3 grid: two regions of colour 1, separated by colour 2
    // [1,1,1]
    // [2,2,2]
    // [1,1,1]
    const indices = [1, 1, 1, 2, 2, 2, 1, 1, 1]
    session = new PaintingSession(makeArtwork(indices, 3, 3), fakeStore())
    session.selectedPaletteIndex = 1
  })

  it('fills the connected region only', () => {
    session.bucketFill(0, 0)
    expect(session.grid.cell(0, 0).painted).toBe(true)
    expect(session.grid.cell(1, 0).painted).toBe(true)
    expect(session.grid.cell(2, 0).painted).toBe(true)
    // Bottom region not painted
    expect(session.grid.cell(0, 2).painted).toBe(false)
  })

  it('does not fill wrong-number cell', () => {
    session.bucketFill(0, 1) // colour 2, but selected is 1
    expect(session.grid.cell(0, 1).painted).toBe(false)
  })

  it('undo restores exact cells', () => {
    session.bucketFill(0, 0)
    expect(session.grid.cell(0, 0).painted).toBe(true)
    session.undo()
    expect(session.grid.cell(0, 0).painted).toBe(false)
    expect(session.grid.cell(1, 0).painted).toBe(false)
    expect(session.grid.cell(2, 0).painted).toBe(false)
  })

  it('does nothing on already-painted cell', () => {
    session.grid.paint(0, 0)
    const events: string[] = []
    session.on('change', (t) => events.push(t))
    session.bucketFill(0, 0)
    expect(events).toHaveLength(0)
  })
})

describe('PaintingSession — fillAllOfSelected', () => {
  let session: PaintingSession

  beforeEach(() => {
    const indices = [1, 2, 1, 2, 1]
    session = new PaintingSession(makeArtwork(indices, 5, 1), fakeStore())
    session.selectedPaletteIndex = 1
  })

  it('paints all cells of the selected colour', () => {
    session.fillAllOfSelected()
    expect(session.grid.cell(0, 0).painted).toBe(true)
    expect(session.grid.cell(2, 0).painted).toBe(true)
    expect(session.grid.cell(4, 0).painted).toBe(true)
    // Other colour untouched
    expect(session.grid.cell(1, 0).painted).toBe(false)
  })

  it('undo restores all cells', () => {
    session.fillAllOfSelected()
    session.undo()
    expect(session.grid.cell(0, 0).painted).toBe(false)
    expect(session.grid.cell(2, 0).painted).toBe(false)
    expect(session.grid.cell(4, 0).painted).toBe(false)
  })

  it('no-ops when colour is already complete', () => {
    session.grid.paint(0, 0)
    session.grid.paint(2, 0)
    session.grid.paint(4, 0)
    const events: string[] = []
    session.on('change', (t) => events.push(t))
    session.fillAllOfSelected()
    expect(events).toHaveLength(0)
  })
})

describe('PaintingSession - completion undo', () => {
  it('undo after completing clears the pending number fade and saves an incomplete puzzle', () => {
    vi.useFakeTimers()
    try {
      const store = fakeStore()
      const session = new PaintingSession(makeArtwork([0], 1, 1), store)
      const events: string[] = []
      session.on('change', (t) => events.push(t))

      session.tap(0, 0)
      expect(session.isComplete).toBe(true)

      session.undo()
      vi.advanceTimersByTime(600)

      expect(session.isComplete).toBe(false)
      expect(session.numbersVisible).toBe(true)
      expect(events).toContain('completionChanged')
      const lastSaved = vi.mocked(store.save).mock.calls.at(-1)?.[0]
      expect(lastSaved?.isComplete).toBe(false)
    } finally {
      vi.useRealTimers()
    }
  })

  it('undo after the number fade restores number visibility', () => {
    vi.useFakeTimers()
    try {
      const session = new PaintingSession(makeArtwork([0], 1, 1), fakeStore())
      const events: string[] = []
      session.on('change', (t) => events.push(t))

      session.tap(0, 0)
      vi.advanceTimersByTime(500)
      expect(session.numbersVisible).toBe(false)

      events.length = 0
      session.undo()

      expect(session.numbersVisible).toBe(true)
      expect(events).toContain('numbersVisibilityChanged')
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('PaintingSession - colour completion', () => {
  it('emits colourCompleted when the selected colour is finished', () => {
    const session = new PaintingSession(makeArtwork([0, 0, 1], 3, 1), fakeStore())
    const events: string[] = []
    session.on('change', (t) => events.push(t))

    session.tap(0, 0)
    expect(events).not.toContain('colourCompleted')

    session.tap(1, 0)

    expect(events).toContain('colourCompleted')
    expect(session.lastCompletedPaletteIndex).toBe(0)
    expect(session.selectedPaletteIndex).toBe(1)
  })
})

describe('PaintingSession - hints', () => {
  it('emits hintRequested without painting cells', () => {
    const session = new PaintingSession(makeArtwork([0, 0], 2, 1), fakeStore())
    const events: string[] = []
    session.on('change', (t) => events.push(t))

    session.requestHint()

    expect(events).toContain('hintRequested')
    expect(session.grid.unpaintedCount).toBe(2)
  })

  it('does not request a hint when the selected colour is complete', () => {
    const session = new PaintingSession(makeArtwork([0], 1, 1), fakeStore())
    const events: string[] = []
    session.on('change', (t) => events.push(t))
    session.fillAllOfSelected()
    events.length = 0

    session.requestHint()

    expect(events).not.toContain('hintRequested')
  })
})
